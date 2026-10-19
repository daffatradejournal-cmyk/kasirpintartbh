import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';
import '../../../core/database/database_helper.dart';
import '../models/product_model.dart';
import 'inventory_state.dart';

class InventoryCubit extends Cubit<InventoryState> {
  InventoryCubit() : super(const InventoryState());

  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<void> loadProducts() async {
    emit(state.copyWith(status: InventoryStatus.loading));
    try {
      final db = await _dbHelper.database;

      // 1. Fetch Categories
      final catRows = await db.query('categories', orderBy: 'id ASC');
      final catList = ['Semua', ...catRows.map((r) => r['name'] as String)];

      // 2. Fetch Products
      final productRows = await db.query('products', orderBy: 'name ASC');
      final products = productRows.map((r) => ProductModel.fromMap(r)).toList();

      emit(state.copyWith(
        status: InventoryStatus.loaded,
        allProducts: products,
        categories: catList,
      ));

      _applyFilters();
    } catch (e) {
      emit(state.copyWith(
        status: InventoryStatus.error,
        errorMessage: 'Gagal memuat produk: $e',
      ));
    }
  }

  void filterByCategory(String category) {
    emit(state.copyWith(selectedCategory: category));
    _applyFilters();
  }

  void searchProduct(String query) {
    emit(state.copyWith(searchQuery: query));
    _applyFilters();
  }

  void toggleLowStockFilter() {
    emit(state.copyWith(isLowStockOnly: !state.isLowStockOnly));
    _applyFilters();
  }

  void _applyFilters() {
    List<ProductModel> list = List.from(state.allProducts);

    // Filter by Category
    if (state.selectedCategory != 'Semua') {
      list = list.where((p) => p.categoryName == state.selectedCategory).toList();
    }

    // Filter by Low Stock only
    if (state.isLowStockOnly) {
      list = list.where((p) => p.isLowStock || p.isOutOfStock).toList();
    }

    // Filter by Search Query (Name or Barcode)
    if (state.searchQuery.trim().isNotEmpty) {
      final q = state.searchQuery.trim().toLowerCase();
      list = list.where((p) {
        return p.name.toLowerCase().contains(q) || p.code.toLowerCase().contains(q);
      }).toList();
    }

    emit(state.copyWith(filteredProducts: list));
  }

  ProductModel? findProductByBarcode(String barcode) {
    try {
      return state.allProducts.firstWhere(
        (p) => p.code.trim().toLowerCase() == barcode.trim().toLowerCase(),
      );
    } catch (_) {
      return null;
    }
  }

  Future<bool> addProduct(ProductModel product) async {
    try {
      final db = await _dbHelper.database;

      // Check duplicate barcode
      final existing = await db.query(
        'products',
        where: 'code = ?',
        whereArgs: [product.code],
      );

      if (existing.isNotEmpty) {
        emit(state.copyWith(
          errorMessage: 'Barcode/SKU "${product.code}" sudah digunakan oleh produk lain!',
        ));
        return false;
      }

      final productMap = product.toMap();
      await db.insert('products', productMap);

      // Register to Sync Queue
      await db.insert('sync_queue', {
        'entity_type': 'product',
        'entity_id': product.id,
        'action': 'INSERT',
        'payload': product.name,
        'created_at': DateTime.now().toIso8601String(),
        'status': 'PENDING',
        'retry_count': 0,
      });

      await loadProducts();
      return true;
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Gagal menambah barang: $e'));
      return false;
    }
  }

  Future<bool> updateProduct(ProductModel product) async {
    try {
      final db = await _dbHelper.database;

      // Check if barcode belongs to another product
      final existing = await db.query(
        'products',
        where: 'code = ? AND id != ?',
        whereArgs: [product.code, product.id],
      );

      if (existing.isNotEmpty) {
        emit(state.copyWith(
          errorMessage: 'Barcode "${product.code}" sudah dipakai barang lain!',
        ));
        return false;
      }

      await db.update(
        'products',
        product.toMap(),
        where: 'id = ?',
        whereArgs: [product.id],
      );

      // Sync Queue
      await db.insert('sync_queue', {
        'entity_type': 'product',
        'entity_id': product.id,
        'action': 'UPDATE',
        'payload': product.name,
        'created_at': DateTime.now().toIso8601String(),
        'status': 'PENDING',
        'retry_count': 0,
      });

      await loadProducts();
      return true;
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Gagal mengubah barang: $e'));
      return false;
    }
  }

  Future<bool> adjustStock(String productId, double additionalStock) async {
    try {
      final db = await _dbHelper.database;
      await db.rawUpdate('''
        UPDATE products 
        SET stock = stock + ?, updated_at = ?
        WHERE id = ?
      ''', [additionalStock, DateTime.now().toIso8601String(), productId]);

      // Sync Queue
      await db.insert('sync_queue', {
        'entity_type': 'product_stock',
        'entity_id': productId,
        'action': 'UPDATE',
        'payload': 'RESTOCK: $additionalStock',
        'created_at': DateTime.now().toIso8601String(),
        'status': 'PENDING',
        'retry_count': 0,
      });

      await loadProducts();
      return true;
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Gagal memperbarui stok: $e'));
      return false;
    }
  }

  Future<bool> deleteProduct(String id) async {
    try {
      final db = await _dbHelper.database;
      await db.delete('products', where: 'id = ?', whereArgs: [id]);

      await db.insert('sync_queue', {
        'entity_type': 'product',
        'entity_id': id,
        'action': 'DELETE',
        'payload': id,
        'created_at': DateTime.now().toIso8601String(),
        'status': 'PENDING',
        'retry_count': 0,
      });

      await loadProducts();
      return true;
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Gagal menghapus barang: $e'));
      return false;
    }
  }

  Future<void> addCategory(String categoryName) async {
    try {
      final db = await _dbHelper.database;
      await db.insert(
        'categories',
        {'name': categoryName},
        conflictAlgorithm: ConflictAlgorithm.ignore,
      );
      await loadProducts();
    } catch (_) {}
  }
}
