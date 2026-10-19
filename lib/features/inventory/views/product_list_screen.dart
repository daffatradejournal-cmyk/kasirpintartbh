import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../cubit/inventory_cubit.dart';
import '../cubit/inventory_state.dart';
import '../models/product_model.dart';
import 'add_edit_product_screen.dart';
import 'barcode_scanner_screen.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _scanToSearch() async {
    final scanned = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (_) => const BarcodeScannerScreen(title: 'Scan Cari Barang'),
      ),
    );

    if (scanned != null && scanned.isNotEmpty) {
      _searchController.text = scanned;
      context.read<InventoryCubit>().searchProduct(scanned);
    }
  }

  void _showRestockDialog(ProductModel product) {
    final qtyController = TextEditingController(text: '10');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.add_shopping_cart_rounded, color: AppColors.primary),
            const SizedBox(width: 8),
            const Text('Kulakan / Tambah Stok'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              product.name,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            Text(
              'Stok saat ini: ${product.stock} ${product.unit}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: qtyController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
              decoration: InputDecoration(
                labelText: 'Jumlah Tambahan Stok Masuk (${product.unit})',
                prefixIcon: const Icon(Icons.input_rounded),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              final added = double.tryParse(qtyController.text.replaceAll(',', '.')) ?? 0.0;
              if (added > 0) {
                context.read<InventoryCubit>().adjustStock(product.id, added);
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: AppColors.success,
                    content: Text('Stok ${product.name} bertambah +$added ${product.unit}!'),
                  ),
                );
              }
            },
            child: const Text('Tambah Stok'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(ProductModel product) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Produk?'),
        content: Text('Yakin ingin menghapus "${product.name}" dari katalog?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              context.read<InventoryCubit>().deleteProduct(product.id);
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Produk berhasil dihapus')),
              );
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Katalog & Kontrol Stok'),
        actions: [
          IconButton(
            tooltip: 'Scan Barcode',
            icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary),
            onPressed: _scanToSearch,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('TAMBAH BARANG', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const AddEditProductScreen()),
          );
        },
      ),
      body: BlocBuilder<InventoryCubit, InventoryState>(
        builder: (context, state) {
          return Column(
            children: [
              // Search Bar & Filter Controls
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari nama barang atau scan barcode...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (_searchController.text.isNotEmpty)
                          IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 20),
                            onPressed: () {
                              _searchController.clear();
                              context.read<InventoryCubit>().searchProduct('');
                            },
                          ),
                        IconButton(
                          icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary),
                          onPressed: _scanToSearch,
                        ),
                      ],
                    ),
                  ),
                  onChanged: (val) {
                    context.read<InventoryCubit>().searchProduct(val);
                  },
                ),
              ),

              // Horizontal Category Chips & Low-Stock Toggle
              SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  children: [
                    // Low Stock Alert Filter Chip
                    FilterChip(
                      selected: state.isLowStockOnly,
                      showCheckmark: false,
                      avatar: CircleAvatar(
                        radius: 8,
                        backgroundColor: state.lowStockCount > 0 ? AppColors.accentRose : AppColors.textTertiary,
                        child: Text(
                          state.lowStockCount.toString(),
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      label: Text(
                        'Stok Menipis (${state.lowStockCount})',
                        style: TextStyle(
                          color: state.isLowStockOnly ? Colors.white : AppColors.accentRose,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      backgroundColor: AppColors.accentRose.withOpacity(0.1),
                      selectedColor: AppColors.accentRose,
                      onSelected: (_) => context.read<InventoryCubit>().toggleLowStockFilter(),
                    ),
                    const SizedBox(width: 8),

                    // Category Chips
                    ...state.categories.map((cat) {
                      final isSelected = state.selectedCategory == cat && !state.isLowStockOnly;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          selected: isSelected,
                          label: Text(cat, style: const TextStyle(fontSize: 12)),
                          onSelected: (selected) {
                            if (selected) {
                              if (state.isLowStockOnly) {
                                context.read<InventoryCubit>().toggleLowStockFilter();
                              }
                              context.read<InventoryCubit>().filterByCategory(cat);
                            }
                          },
                        ),
                      );
                    }),
                  ],
                ),
              ),

              const Divider(height: 12),

              // Product List Items
              Expanded(
                child: state.status == InventoryStatus.loading
                    ? const Center(child: CircularProgressIndicator())
                    : state.filteredProducts.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.inventory_2_outlined, size: 54, color: Colors.grey.shade400),
                                const SizedBox(height: 12),
                                const Text(
                                  'Tidak ada produk ditemukan',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Coba ubah kata kunci atau tambah produk baru.',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 90),
                            itemCount: state.filteredProducts.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final product = state.filteredProducts[index];
                              return _buildProductCard(context, product);
                            },
                          ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, ProductModel product) {
    Color stockBadgeColor;
    Color stockBadgeBg;
    String stockStatusText;

    if (product.isOutOfStock) {
      stockBadgeColor = AppColors.accentRose;
      stockBadgeBg = AppColors.accentRose.withOpacity(0.12);
      stockStatusText = 'Habis (0 ${product.unit})';
    } else if (product.isLowStock) {
      stockBadgeColor = AppColors.accentAmber;
      stockBadgeBg = AppColors.accentAmber.withOpacity(0.12);
      stockStatusText = 'Menipis: ${product.stock} ${product.unit} (Min ${product.minStock})';
    } else {
      stockBadgeColor = AppColors.accentEmerald;
      stockBadgeBg = AppColors.accentEmerald.withOpacity(0.12);
      stockStatusText = '${product.stock} ${product.unit}';
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Icon container
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      product.name.isNotEmpty ? product.name[0].toUpperCase() : 'P',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Name & Code
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.qr_code_rounded, size: 14, color: AppColors.textTertiary),
                          const SizedBox(width: 4),
                          Text(
                            product.code,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 11.5,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '• ${product.categoryName}',
                            style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Popup Options
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, size: 20),
                  onSelected: (val) {
                    if (val == 'edit') {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => AddEditProductScreen(product: product),
                        ),
                      );
                    } else if (val == 'restock') {
                      _showRestockDialog(product);
                    } else if (val == 'delete') {
                      _confirmDelete(product);
                    }
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(
                      value: 'restock',
                      child: Row(
                        children: [
                          Icon(Icons.add_shopping_cart_rounded, size: 18),
                          SizedBox(width: 8),
                          Text('Kulakan / Tambah Stok'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit_rounded, size: 18),
                          SizedBox(width: 8),
                          Text('Edit Produk'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 18),
                          SizedBox(width: 8),
                          Text('Hapus', style: TextStyle(color: AppColors.error)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 18),

            // Price, Stock & Quick Restock Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      CurrencyFormatter.format(product.sellPrice),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    Text(
                      'Modal: ${CurrencyFormatter.format(product.buyPrice)} (Laba: +${CurrencyFormatter.format(product.profitMargin)})',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),

                // Stock Badge & Quick Button
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: stockBadgeBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: stockBadgeColor.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            product.isOutOfStock
                                ? Icons.cancel_rounded
                                : product.isLowStock
                                    ? Icons.warning_amber_rounded
                                    : Icons.inventory_2_rounded,
                            size: 13,
                            color: stockBadgeColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            stockStatusText,
                            style: TextStyle(
                              color: stockBadgeColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    IconButton(
                      tooltip: 'Kulakan Tambah Stok',
                      icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primary),
                      onPressed: () => _showRestockDialog(product),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
