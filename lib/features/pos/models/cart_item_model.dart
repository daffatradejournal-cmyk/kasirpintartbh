import 'package:equatable/equatable.dart';
import '../../inventory/models/product_model.dart';

class CartItemModel extends Equatable {
  final ProductModel product;
  final double quantity;
  final double discount; // Discount amount in Rupiah
  final String? note;

  const CartItemModel({
    required this.product,
    this.quantity = 1.0,
    this.discount = 0.0,
    this.note,
  });

  double get grossSubtotal => product.sellPrice * quantity;
  double get subtotal => (product.sellPrice * quantity) - discount;
  double get profit => (product.profitMargin * quantity) - discount;

  CartItemModel copyWith({
    ProductModel? product,
    double? quantity,
    double? discount,
    String? note,
  }) {
    return CartItemModel(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      discount: discount ?? this.discount,
      note: note ?? this.note,
    );
  }

  @override
  List<Object?> get props => [product, quantity, discount, note];
}
