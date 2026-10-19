import 'package:equatable/equatable.dart';

class ProductModel extends Equatable {
  final String id;
  final String code;
  final String name;
  final String categoryName;
  final double buyPrice;
  final double sellPrice;
  final double stock;
  final double minStock;
  final String unit;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ProductModel({
    required this.id,
    required this.code,
    required this.name,
    required this.categoryName,
    required this.buyPrice,
    required this.sellPrice,
    required this.stock,
    this.minStock = 5.0,
    this.unit = 'Pcs',
    this.imageUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isOutOfStock => stock <= 0;
  bool get isLowStock => stock > 0 && stock <= minStock;
  double get profitMargin => sellPrice - buyPrice;
  double get profitPercentage => buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0.0;

  ProductModel copyWith({
    String? id,
    String? code,
    String? name,
    String? categoryName,
    double? buyPrice,
    double? sellPrice,
    double? stock,
    double? minStock,
    String? unit,
    String? imageUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ProductModel(
      id: id ?? this.id,
      code: code ?? this.code,
      name: name ?? this.name,
      categoryName: categoryName ?? this.categoryName,
      buyPrice: buyPrice ?? this.buyPrice,
      sellPrice: sellPrice ?? this.sellPrice,
      stock: stock ?? this.stock,
      minStock: minStock ?? this.minStock,
      unit: unit ?? this.unit,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'category_name': categoryName,
      'buy_price': buyPrice,
      'sell_price': sellPrice,
      'stock': stock,
      'min_stock': minStock,
      'unit': unit,
      'image_url': imageUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory ProductModel.fromMap(Map<String, dynamic> map) {
    return ProductModel(
      id: map['id'] as String,
      code: map['code'] as String,
      name: map['name'] as String,
      categoryName: map['category_name'] as String,
      buyPrice: (map['buy_price'] as num).toDouble(),
      sellPrice: (map['sell_price'] as num).toDouble(),
      stock: (map['stock'] as num).toDouble(),
      minStock: (map['min_stock'] as num?)?.toDouble() ?? 5.0,
      unit: (map['unit'] as String?) ?? 'Pcs',
      imageUrl: map['image_url'] as String?,
      createdAt: DateTime.tryParse(map['created_at'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        code,
        name,
        categoryName,
        buyPrice,
        sellPrice,
        stock,
        minStock,
        unit,
        imageUrl,
        createdAt,
        updatedAt,
      ];
}
