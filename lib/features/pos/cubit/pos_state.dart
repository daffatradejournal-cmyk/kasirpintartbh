import 'package:equatable/equatable.dart';
import '../../receipt/models/transaction_model.dart';
import '../models/cart_item_model.dart';

class PosState extends Equatable {
  final List<CartItemModel> items;
  final double cartDiscount;
  final String? orderNote;
  final String? customerName;
  final String? customerPhone;
  final String selectedPaymentMethod;
  final bool isCheckingOut;
  final TransactionModel? completedTransaction;
  final String? errorMessage;

  const PosState({
    this.items = const [],
    this.cartDiscount = 0.0,
    this.orderNote,
    this.customerName,
    this.customerPhone,
    this.selectedPaymentMethod = 'CASH',
    this.isCheckingOut = false,
    this.completedTransaction,
    this.errorMessage,
  });

  double get grossTotal {
    return items.fold<double>(0.0, (acc, item) => acc + item.grossSubtotal);
  }

  double get itemsDiscountTotal {
    return items.fold<double>(0.0, (acc, item) => acc + item.discount);
  }

  double get totalDiscount => itemsDiscountTotal + cartDiscount;

  double get finalTotal {
    final t = grossTotal - totalDiscount;
    return t < 0 ? 0.0 : t;
  }

  int get totalItemsCount {
    return items.fold<int>(0, (acc, item) => acc + item.quantity.toInt());
  }

  bool get isEmpty => items.isEmpty;

  PosState copyWith({
    List<CartItemModel>? items,
    double? cartDiscount,
    String? orderNote,
    String? customerName,
    String? customerPhone,
    String? selectedPaymentMethod,
    bool? isCheckingOut,
    TransactionModel? completedTransaction,
    String? errorMessage,
    bool clearCompleted = false,
  }) {
    return PosState(
      items: items ?? this.items,
      cartDiscount: cartDiscount ?? this.cartDiscount,
      orderNote: orderNote ?? this.orderNote,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      selectedPaymentMethod: selectedPaymentMethod ?? this.selectedPaymentMethod,
      isCheckingOut: isCheckingOut ?? this.isCheckingOut,
      completedTransaction: clearCompleted ? null : (completedTransaction ?? this.completedTransaction),
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        items,
        cartDiscount,
        orderNote,
        customerName,
        customerPhone,
        selectedPaymentMethod,
        isCheckingOut,
        completedTransaction,
        errorMessage,
      ];
}
