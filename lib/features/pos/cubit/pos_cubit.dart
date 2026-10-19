import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import '../../../core/database/database_helper.dart';
import '../../../core/utils/date_formatter.dart';
import '../../inventory/models/product_model.dart';
import '../../receipt/models/transaction_model.dart';
import '../models/cart_item_model.dart';
import 'pos_state.dart';

class PosCubit extends Cubit<PosState> {
  PosCubit() : super(const PosState());

  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  void addToCart(ProductModel product, [double qty = 1.0]) {
    if (product.isOutOfStock) {
      emit(state.copyWith(errorMessage: 'Stok "${product.name}" habis!'));
      return;
    }

    final index = state.items.indexWhere((it) => it.product.id == product.id);
    List<CartItemModel> updatedList = List.from(state.items);

    if (index >= 0) {
      final currentItem = state.items[index];
      final newQty = currentItem.quantity + qty;

      if (newQty > product.stock) {
        emit(state.copyWith(
          errorMessage: 'Maksimum stok ${product.name} hanya ${product.stock} ${product.unit}',
        ));
        return;
      }

      updatedList[index] = currentItem.copyWith(quantity: newQty);
    } else {
      if (qty > product.stock) {
        emit(state.copyWith(
          errorMessage: 'Maksimum stok ${product.name} hanya ${product.stock} ${product.unit}',
        ));
        return;
      }
      updatedList.add(CartItemModel(product: product, quantity: qty));
    }

    emit(state.copyWith(items: updatedList, errorMessage: null));
  }

  void updateQuantity(String productId, double newQty) {
    List<CartItemModel> updatedList = List.from(state.items);
    final index = updatedList.indexWhere((it) => it.product.id == productId);

    if (index < 0) return;

    if (newQty <= 0) {
      updatedList.removeAt(index);
    } else {
      final item = updatedList[index];
      if (newQty > item.product.stock) {
        emit(state.copyWith(
          errorMessage: 'Stok tersedia hanya ${item.product.stock} ${item.product.unit}',
        ));
        return;
      }
      updatedList[index] = item.copyWith(quantity: newQty);
    }

    emit(state.copyWith(items: updatedList, errorMessage: null));
  }

  void removeItem(String productId) {
    final updatedList = state.items.where((it) => it.product.id != productId).toList();
    emit(state.copyWith(items: updatedList));
  }

  void updateItemDiscount(String productId, double discount) {
    final index = state.items.indexWhere((it) => it.product.id == productId);
    if (index >= 0) {
      final updatedList = List<CartItemModel>.from(state.items);
      updatedList[index] = updatedList[index].copyWith(discount: discount);
      emit(state.copyWith(items: updatedList));
    }
  }

  void setCartDiscount(double discount) {
    emit(state.copyWith(cartDiscount: discount));
  }

  void setCustomerInfo({String? name, String? phone, String? note}) {
    emit(state.copyWith(
      customerName: name ?? state.customerName,
      customerPhone: phone ?? state.customerPhone,
      orderNote: note ?? state.orderNote,
    ));
  }

  void setPaymentMethod(String method) {
    emit(state.copyWith(selectedPaymentMethod: method));
  }

  void clearCart() {
    emit(const PosState());
  }

  void resetCompletedTransaction() {
    emit(state.copyWith(clearCompleted: true));
  }

  Future<bool> processCheckout({
    required double paidAmount,
    required String cashierName,
  }) async {
    if (state.isEmpty) {
      emit(state.copyWith(errorMessage: 'Keranjang belanja masih kosong!'));
      return false;
    }

    final totalToPay = state.finalTotal;
    if (paidAmount < totalToPay) {
      emit(state.copyWith(errorMessage: 'Uang pembayaran kurang dari total belanja!'));
      return false;
    }

    emit(state.copyWith(isCheckingOut: true, errorMessage: null));

    try {
      final db = await _dbHelper.database;
      const uuid = Uuid();
      final transactionId = uuid.v4();
      final now = DateTime.now();

      // Count existing transactions today for sequence number
      final countResult = await db.rawQuery('SELECT COUNT(*) as count FROM transactions');
      final currentCount = (countResult.first['count'] as num? ?? 0).toInt() + 1;
      final invoiceNumber = AppDateFormatter.generateInvoiceNumber(currentCount);

      final changeAmount = paidAmount - totalToPay;

      final transactionItemModels = <TransactionItemModel>[];
      final itemsMapList = <Map<String, dynamic>>[];

      for (final cartItem in state.items) {
        final itemId = uuid.v4();
        final itemModel = TransactionItemModel(
          id: itemId,
          transactionId: transactionId,
          productId: cartItem.product.id,
          productCode: cartItem.product.code,
          productName: cartItem.product.name,
          unit: cartItem.product.unit,
          buyPrice: cartItem.product.buyPrice,
          sellPrice: cartItem.product.sellPrice,
          discount: cartItem.discount,
          quantity: cartItem.quantity,
          subtotal: cartItem.subtotal,
        );

        transactionItemModels.add(itemModel);
        itemsMapList.add(itemModel.toMap());
      }

      final transactionModel = TransactionModel(
        id: transactionId,
        invoiceNumber: invoiceNumber,
        createdAt: now,
        totalAmount: state.grossTotal,
        discountAmount: state.totalDiscount,
        finalAmount: totalToPay,
        paidAmount: paidAmount,
        changeAmount: changeAmount,
        paymentMethod: state.selectedPaymentMethod,
        cashierName: cashierName,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        note: state.orderNote,
        isVoid: false,
        isSynced: false,
        items: transactionItemModels,
      );

      // Atomic checkout into SQLite with stock decrement
      await _dbHelper.checkoutTransaction(
        transactionMap: transactionModel.toMap(),
        items: itemsMapList,
      );

      emit(PosState(
        completedTransaction: transactionModel,
        isCheckingOut: false,
      ));

      return true;
    } catch (e) {
      emit(state.copyWith(
        isCheckingOut: false,
        errorMessage: 'Gagal memproses transaksi: $e',
      ));
      return false;
    }
  }
}
