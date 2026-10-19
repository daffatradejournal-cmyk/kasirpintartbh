import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/sync_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';
import '../../inventory/cubit/inventory_cubit.dart';
import '../../inventory/cubit/inventory_state.dart';
import '../../inventory/models/product_model.dart';
import '../../inventory/views/barcode_scanner_screen.dart';
import '../cubit/pos_cubit.dart';
import '../cubit/pos_state.dart';
import 'cart_sheet.dart';
import 'payment_dialog.dart';

class CashierScreen extends StatefulWidget {
  const CashierScreen({super.key});

  @override
  State<CashierScreen> createState() => _CashierScreenState();
}

class _CashierScreenState extends State<CashierScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _scanBarcodeDirectly() async {
    final scanned = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (_) => const BarcodeScannerScreen(title: 'Scan Kasir Cepat'),
      ),
    );

    if (scanned != null && scanned.isNotEmpty && mounted) {
      final invCubit = context.read<InventoryCubit>();
      final product = invCubit.findProductByBarcode(scanned);

      if (product != null) {
        context.read<PosCubit>().addToCart(product);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            duration: const Duration(seconds: 1),
            backgroundColor: AppColors.primary,
            content: Text('+1 ${product.name} dimasukkan ke keranjang'),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.error,
            content: Text('Barcode "$scanned" tidak ditemukan di katalog produk!'),
          ),
        );
      }
    }
  }

  void _openCartSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const CartSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PosCubit, PosState>(
      listener: (context, state) {
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppColors.warning,
              content: Text(state.errorMessage!),
            ),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: BlocBuilder<AuthCubit, AuthState>(
            builder: (context, state) {
              String storeName = AppConstants.defaultStoreName;
              String cashier = AppConstants.defaultCashierName;
              if (state is AuthLoaded) {
                storeName = state.profile.storeName;
                cashier = state.profile.activeCashier;
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    storeName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Text(
                    'Kasir: $cashier • Offline-Ready',
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              );
            },
          ),
          actions: [
            // Barcode Quick Scan Action Button
            IconButton(
              tooltip: 'Scan Barcode Kasir',
              icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary, size: 26),
              onPressed: _scanBarcodeDirectly,
            ),
          ],
        ),
        body: Stack(
          children: [
            Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Cari produk atau scan barcode...',
                      prefixIcon: const Icon(Icons.search_rounded),
                      suffixIcon: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_searchController.text.isNotEmpty)
                            IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                context.read<InventoryCubit>().searchProduct('');
                              },
                            ),
                          IconButton(
                            icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primary),
                            onPressed: _scanBarcodeDirectly,
                          ),
                        ],
                      ),
                    ),
                    onChanged: (val) {
                      context.read<InventoryCubit>().searchProduct(val);
                    },
                  ),
                ),

                // Horizontal Category Selector
                BlocBuilder<InventoryCubit, InventoryState>(
                  builder: (context, invState) {
                    return SizedBox(
                      height: 48,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        itemCount: invState.categories.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final cat = invState.categories[index];
                          final isSelected = invState.selectedCategory == cat;

                          return ChoiceChip(
                            selected: isSelected,
                            label: Text(cat, style: const TextStyle(fontSize: 12)),
                            onSelected: (selected) {
                              if (selected) {
                                context.read<InventoryCubit>().filterByCategory(cat);
                              }
                            },
                          );
                        },
                      ),
                    );
                  },
                ),

                const Divider(height: 1),

                // Product Catalog Grid
                Expanded(
                  child: BlocBuilder<InventoryCubit, InventoryState>(
                    builder: (context, invState) {
                      if (invState.status == InventoryStatus.loading) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final products = invState.filteredProducts;
                      if (products.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.search_off_rounded, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 8),
                              const Text('Produk tidak ditemukan', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              const Text('Periksa ejaan nama atau kata kunci pencarian.',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        );
                      }

                      return GridView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.82,
                        ),
                        itemCount: products.length,
                        itemBuilder: (context, index) {
                          final product = products[index];
                          return _buildCatalogCard(context, product);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),

            // Sticky Bottom Cart Bar
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: BlocBuilder<PosCubit, PosState>(
                builder: (context, posState) {
                  if (posState.isEmpty) return const SizedBox.shrink();

                  return InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => _openCartSheet(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          // Cart badge
                          Badge(
                            label: Text(
                              posState.totalItemsCount.toString(),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            backgroundColor: AppColors.accentRose,
                            child: const Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 28),
                          ),
                          const SizedBox(width: 14),

                          // Price details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  '${posState.items.length} Macam Barang (${posState.totalItemsCount} pcs)',
                                  style: const TextStyle(color: Colors.white70, fontSize: 11.5),
                                ),
                                Text(
                                  CurrencyFormatter.format(posState.finalTotal),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 17,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Checkout button
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.primaryDark,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            ),
                            onPressed: () {
                              showDialog(
                                context: context,
                                barrierDismissible: false,
                                builder: (_) => const PaymentDialog(),
                              );
                            },
                            child: const Text('BAYAR', style: TextStyle(fontWeight: FontWeight.w900)),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCatalogCard(BuildContext context, ProductModel product) {
    return BlocBuilder<PosCubit, PosState>(
      builder: (context, posState) {
        final cartItemIndex = posState.items.indexWhere((it) => it.product.id == product.id);
        final inCartQty = cartItemIndex >= 0 ? posState.items[cartItemIndex].quantity.toInt() : 0;

        return Card(
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: product.isOutOfStock
                ? null
                : () {
                    context.read<PosCubit>().addToCart(product);
                  },
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Stock badge & in-cart indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: product.isOutOfStock
                              ? AppColors.accentRose.withOpacity(0.12)
                              : product.isLowStock
                                  ? AppColors.accentAmber.withOpacity(0.12)
                                  : AppColors.accentEmerald.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          product.isOutOfStock
                              ? 'Habis'
                              : 'Stok ${product.stock.toInt()} ${product.unit}',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            color: product.isOutOfStock
                                ? AppColors.accentRose
                                : product.isLowStock
                                    ? AppColors.accentAmber
                                    : AppColors.accentEmerald,
                          ),
                        ),
                      ),
                      if (inCartQty > 0)
                        CircleAvatar(
                          radius: 11,
                          backgroundColor: AppColors.primary,
                          child: Text(
                            inCartQty.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const Spacer(),

                  // Product Name
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                  ),
                  const SizedBox(height: 4),

                  // Sell Price
                  Text(
                    CurrencyFormatter.format(product.sellPrice),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primaryDark,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Tactile Add Button
                  SizedBox(
                    width: double.infinity,
                    height: 36,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        backgroundColor: inCartQty > 0 ? AppColors.primaryContainer.withOpacity(0.5) : null,
                        side: BorderSide(
                          color: product.isOutOfStock ? Colors.grey.shade300 : AppColors.primary,
                        ),
                      ),
                      onPressed: product.isOutOfStock
                          ? null
                          : () {
                              context.read<PosCubit>().addToCart(product);
                            },
                      child: Text(
                        product.isOutOfStock ? 'HABIS' : (inCartQty > 0 ? '+ Tambah ($inCartQty)' : '+ Tambah'),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: product.isOutOfStock ? Colors.grey : AppColors.primaryDark,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
