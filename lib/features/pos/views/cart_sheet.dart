import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../cubit/pos_cubit.dart';
import '../cubit/pos_state.dart';
import 'payment_dialog.dart';

class CartSheet extends StatelessWidget {
  const CartSheet({super.key});

  void _showDiscountDialog(BuildContext context, String productId, String name, double currentDiscount) {
    final controller = TextEditingController(
      text: currentDiscount > 0 ? currentDiscount.toInt().toString() : '',
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Diskon Item: $name'),
        content: TextField(
          controller: controller,
          autofocus: true,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Potongan Diskon',
            prefixText: 'Rp ',
            hintText: 'Contoh: 1000',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              context.read<PosCubit>().updateItemDiscount(productId, 0.0);
              Navigator.of(ctx).pop();
            },
            child: const Text('Hapus Diskon', style: TextStyle(color: AppColors.error)),
          ),
          ElevatedButton(
            onPressed: () {
              final discount = CurrencyFormatter.parse(controller.text);
              context.read<PosCubit>().updateItemDiscount(productId, discount);
              Navigator.of(ctx).pop();
            },
            child: const Text('Terapkan'),
          ),
        ],
      ),
    );
  }

  void _showCartDiscountDialog(BuildContext context, double currentDiscount) {
    final controller = TextEditingController(
      text: currentDiscount > 0 ? currentDiscount.toInt().toString() : '',
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Diskon Total Nota'),
        content: TextField(
          controller: controller,
          autofocus: true,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Potongan Diskon Nota',
            prefixText: 'Rp ',
            hintText: 'Contoh: 5000',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              context.read<PosCubit>().setCartDiscount(0.0);
              Navigator.of(ctx).pop();
            },
            child: const Text('Hapus Diskon', style: TextStyle(color: AppColors.error)),
          ),
          ElevatedButton(
            onPressed: () {
              final discount = CurrencyFormatter.parse(controller.text);
              context.read<PosCubit>().setCartDiscount(discount);
              Navigator.of(ctx).pop();
            },
            child: const Text('Terapkan Diskon'),
          ),
        ],
      ),
    );
  }

  void _showCustomerNoteDialog(BuildContext context, PosState state) {
    final nameController = TextEditingController(text: state.customerName ?? '');
    final phoneController = TextEditingController(text: state.customerPhone ?? '');
    final noteController = TextEditingController(text: state.orderNote ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Data Pelanggan & Catatan'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Pelanggan (Opsional)',
                  prefixIcon: Icon(Icons.person_rounded),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Nomor WhatsApp (Opsional)',
                  prefixIcon: Icon(Icons.phone_rounded),
                  hintText: '0812xxxx',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: noteController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Catatan Nota / Pesanan',
                  prefixIcon: Icon(Icons.notes_rounded),
                  hintText: 'Contoh: Bungkus terpisah',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<PosCubit>().setCustomerInfo(
                    name: nameController.text.trim(),
                    phone: phoneController.text.trim(),
                    note: noteController.text.trim(),
                  );
              Navigator.of(ctx).pop();
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PosCubit, PosState>(
      builder: (context, state) {
        if (state.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                const Text(
                  'Keranjang Belanja Masih Kosong',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Pilih barang dari katalog atau scan barcode kemasan untuk menambahkan.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('KEMBALI KE KATALOG'),
                ),
              ],
            ),
          );
        }

        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.85,
          ),
          child: Column(
            children: [
              // Sheet Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Keranjang Kasir',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${state.totalItemsCount} item',
                            style: const TextStyle(
                              color: AppColors.primaryDark,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      style: TextButton.styleFrom(foregroundColor: AppColors.error),
                      icon: const Icon(Icons.delete_sweep_rounded, size: 18),
                      label: const Text('Kosongkan'),
                      onPressed: () {
                        context.read<PosCubit>().clearCart();
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),

              // Item List
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: state.items.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = state.items[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Row(
                        children: [
                          // Details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.product.name,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  CurrencyFormatter.format(item.product.sellPrice),
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                                if (item.discount > 0)
                                  Text(
                                    'Diskon: -${CurrencyFormatter.format(item.discount)}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.accentRose,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                              ],
                            ),
                          ),

                          // Discount per item button
                          IconButton(
                            icon: Icon(
                              Icons.discount_rounded,
                              size: 18,
                              color: item.discount > 0 ? AppColors.accentRose : AppColors.textTertiary,
                            ),
                            tooltip: 'Diskon Item',
                            onPressed: () => _showDiscountDialog(
                              context,
                              item.product.id,
                              item.product.name,
                              item.discount,
                            ),
                          ),

                          // Tactile Quantity Stepper
                          Container(
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                                  padding: EdgeInsets.zero,
                                  icon: Icon(
                                    item.quantity <= 1 ? Icons.delete_outline_rounded : Icons.remove_rounded,
                                    size: 18,
                                    color: item.quantity <= 1 ? AppColors.error : AppColors.textPrimary,
                                  ),
                                  onPressed: () {
                                    context.read<PosCubit>().updateQuantity(
                                          item.product.id,
                                          item.quantity - 1,
                                        );
                                  },
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  child: Text(
                                    item.quantity.toInt().toString(),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                ),
                                IconButton(
                                  constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                                  padding: EdgeInsets.zero,
                                  icon: const Icon(Icons.add_rounded, size: 18),
                                  onPressed: () {
                                    context.read<PosCubit>().updateQuantity(
                                          item.product.id,
                                          item.quantity + 1,
                                        );
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),

                          // Subtotal
                          SizedBox(
                            width: 80,
                            child: Text(
                              CurrencyFormatter.format(item.subtotal),
                              textAlign: TextAlign.end,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Bottom Actions & Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
                  border: const Border(top: BorderSide(color: AppColors.border)),
                ),
                child: Column(
                  children: [
                    // Quick Buttons for Customer Note & Global Discount
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              side: const BorderSide(color: AppColors.border),
                            ),
                            icon: const Icon(Icons.person_outline_rounded, size: 16),
                            label: Text(
                              state.customerName != null && state.customerName!.isNotEmpty
                                  ? state.customerName!
                                  : 'Pelanggan & Catatan',
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 12),
                            ),
                            onPressed: () => _showCustomerNoteDialog(context, state),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              side: const BorderSide(color: AppColors.border),
                            ),
                            icon: const Icon(Icons.loyalty_rounded, size: 16),
                            label: Text(
                              state.cartDiscount > 0
                                  ? '-${CurrencyFormatter.format(state.cartDiscount)}'
                                  : 'Diskon Nota',
                              style: TextStyle(
                                fontSize: 12,
                                color: state.cartDiscount > 0 ? AppColors.accentRose : null,
                              ),
                            ),
                            onPressed: () => _showCartDiscountDialog(context, state.cartDiscount),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Price Breakdown
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Subtotal:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        Text(CurrencyFormatter.format(state.grossTotal), style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                    if (state.totalDiscount > 0)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total Diskon:', style: TextStyle(color: AppColors.accentRose, fontSize: 13)),
                            Text('-${CurrencyFormatter.format(state.totalDiscount)}',
                                style: const TextStyle(color: AppColors.accentRose, fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Akhir:',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          CurrencyFormatter.format(state.finalTotal),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 20,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Pay Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                        ),
                        icon: const Icon(Icons.payment_rounded),
                        label: Text(
                          'LANJUT PEMBAYARAN (${CurrencyFormatter.format(state.finalTotal)})',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () {
                          Navigator.of(context).pop(); // Pop sheet
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (_) => const PaymentDialog(),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
