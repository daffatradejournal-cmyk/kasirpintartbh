import 'package:equatable/equatable.dart';

class TransactionItemModel extends Equatable {
  final String id;
  final String transactionId;
  final String productId;
  final String? productCode;
  final String productName;
  final String unit;
  final double buyPrice;
  final double sellPrice;
  final double discount;
  final double quantity;
  final double subtotal;

  const TransactionItemModel({
    required this.id,
    required this.transactionId,
    required this.productId,
    this.productCode,
    required this.productName,
    this.unit = 'Pcs',
    required this.buyPrice,
    required this.sellPrice,
    this.discount = 0.0,
    required this.quantity,
    required this.subtotal,
  });

  double get netProfit => (sellPrice - buyPrice) * quantity - discount;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'transaction_id': transactionId,
      'product_id': productId,
      'product_code': productCode,
      'product_name': productName,
      'unit': unit,
      'buy_price': buyPrice,
      'sell_price': sellPrice,
      'discount': discount,
      'quantity': quantity,
      'subtotal': subtotal,
    };
  }

  factory TransactionItemModel.fromMap(Map<String, dynamic> map) {
    return TransactionItemModel(
      id: map['id'] as String,
      transactionId: map['transaction_id'] as String,
      productId: map['product_id'] as String,
      productCode: map['product_code'] as String?,
      productName: map['product_name'] as String,
      unit: (map['unit'] as String?) ?? 'Pcs',
      buyPrice: (map['buy_price'] as num).toDouble(),
      sellPrice: (map['sell_price'] as num).toDouble(),
      discount: (map['discount'] as num?)?.toDouble() ?? 0.0,
      quantity: (map['quantity'] as num).toDouble(),
      subtotal: (map['subtotal'] as num).toDouble(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        transactionId,
        productId,
        productCode,
        productName,
        unit,
        buyPrice,
        sellPrice,
        discount,
        quantity,
        subtotal,
      ];
}

class TransactionModel extends Equatable {
  final String id;
  final String invoiceNumber;
  final DateTime createdAt;
  final double totalAmount;
  final double discountAmount;
  final double finalAmount;
  final double paidAmount;
  final double changeAmount;
  final String paymentMethod;
  final String cashierName;
  final String? customerName;
  final String? customerPhone;
  final String? note;
  final bool isVoid;
  final bool isSynced;
  final List<TransactionItemModel> items;

  const TransactionModel({
    required this.id,
    required this.invoiceNumber,
    required this.createdAt,
    required this.totalAmount,
    this.discountAmount = 0.0,
    required this.finalAmount,
    required this.paidAmount,
    required this.changeAmount,
    required this.paymentMethod,
    required this.cashierName,
    this.customerName,
    this.customerPhone,
    this.note,
    this.isVoid = false,
    this.isSynced = false,
    this.items = const [],
  });

  double get totalNetProfit {
    double sum = 0.0;
    for (final it in items) {
      sum += it.netProfit;
    }
    return sum - discountAmount;
  }

  int get totalItemQuantity {
    return items.fold<int>(0, (acc, it) => acc + it.quantity.toInt());
  }

  TransactionModel copyWith({
    String? id,
    String? invoiceNumber,
    DateTime? createdAt,
    double? totalAmount,
    double? discountAmount,
    double? finalAmount,
    double? paidAmount,
    double? changeAmount,
    String? paymentMethod,
    String? cashierName,
    String? customerName,
    String? customerPhone,
    String? note,
    bool? isVoid,
    bool? isSynced,
    List<TransactionItemModel>? items,
  }) {
    return TransactionModel(
      id: id ?? this.id,
      invoiceNumber: invoiceNumber ?? this.invoiceNumber,
      createdAt: createdAt ?? this.createdAt,
      totalAmount: totalAmount ?? this.totalAmount,
      discountAmount: discountAmount ?? this.discountAmount,
      finalAmount: finalAmount ?? this.finalAmount,
      paidAmount: paidAmount ?? this.paidAmount,
      changeAmount: changeAmount ?? this.changeAmount,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      cashierName: cashierName ?? this.cashierName,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      note: note ?? this.note,
      isVoid: isVoid ?? this.isVoid,
      isSynced: isSynced ?? this.isSynced,
      items: items ?? this.items,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'invoice_number': invoiceNumber,
      'created_at': createdAt.toIso8601String(),
      'total_amount': totalAmount,
      'discount_amount': discountAmount,
      'final_amount': finalAmount,
      'paid_amount': paidAmount,
      'change_amount': changeAmount,
      'payment_method': paymentMethod,
      'cashier_name': cashierName,
      'customer_name': customerName,
      'customer_phone': customerPhone,
      'note': note,
      'is_void': isVoid ? 1 : 0,
      'is_synced': isSynced ? 1 : 0,
    };
  }

  factory TransactionModel.fromMap(
    Map<String, dynamic> map, [
    List<TransactionItemModel> items = const [],
  ]) {
    return TransactionModel(
      id: map['id'] as String,
      invoiceNumber: map['invoice_number'] as String,
      createdAt: DateTime.tryParse(map['created_at'] as String? ?? '') ?? DateTime.now(),
      totalAmount: (map['total_amount'] as num).toDouble(),
      discountAmount: (map['discount_amount'] as num?)?.toDouble() ?? 0.0,
      finalAmount: (map['final_amount'] as num).toDouble(),
      paidAmount: (map['paid_amount'] as num).toDouble(),
      changeAmount: (map['change_amount'] as num).toDouble(),
      paymentMethod: map['payment_method'] as String,
      cashierName: map['cashier_name'] as String,
      customerName: map['customer_name'] as String?,
      customerPhone: map['customer_phone'] as String?,
      note: map['note'] as String?,
      isVoid: (map['is_void'] as int?) == 1,
      isSynced: (map['is_synced'] as int?) == 1,
      items: items,
    );
  }

  @override
  List<Object?> get props => [
        id,
        invoiceNumber,
        createdAt,
        totalAmount,
        discountAmount,
        finalAmount,
        paidAmount,
        changeAmount,
        paymentMethod,
        cashierName,
        customerName,
        customerPhone,
        note,
        isVoid,
        isSynced,
        items,
      ];
}
