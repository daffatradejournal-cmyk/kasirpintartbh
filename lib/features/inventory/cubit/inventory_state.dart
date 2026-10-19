import 'package:equatable/equatable.dart';
import '../models/product_model.dart';

enum InventoryStatus { initial, loading, loaded, error }

class InventoryState extends Equatable {
  final InventoryStatus status;
  final List<ProductModel> allProducts;
  final List<ProductModel> filteredProducts;
  final List<String> categories;
  final String selectedCategory;
  final String searchQuery;
  final bool isLowStockOnly;
  final String? errorMessage;

  const InventoryState({
    this.status = InventoryStatus.initial,
    this.allProducts = const [],
    this.filteredProducts = const [],
    this.categories = const ['Semua'],
    this.selectedCategory = 'Semua',
    this.searchQuery = '',
    this.isLowStockOnly = false,
    this.errorMessage,
  });

  int get lowStockCount => allProducts.where((p) => p.isLowStock || p.isOutOfStock).length;

  InventoryState copyWith({
    InventoryStatus? status,
    List<ProductModel>? allProducts,
    List<ProductModel>? filteredProducts,
    List<String>? categories,
    String? selectedCategory,
    String? searchQuery,
    bool? isLowStockOnly,
    String? errorMessage,
  }) {
    return InventoryState(
      status: status ?? this.status,
      allProducts: allProducts ?? this.allProducts,
      filteredProducts: filteredProducts ?? this.filteredProducts,
      categories: categories ?? this.categories,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      searchQuery: searchQuery ?? this.searchQuery,
      isLowStockOnly: isLowStockOnly ?? this.isLowStockOnly,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        allProducts,
        filteredProducts,
        categories,
        selectedCategory,
        searchQuery,
        isLowStockOnly,
        errorMessage,
      ];
}
