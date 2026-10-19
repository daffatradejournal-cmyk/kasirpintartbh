import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../inventory/cubit/inventory_cubit.dart';
import '../../receipt/models/transaction_model.dart';
import '../../receipt/views/receipt_preview_screen.dart';
import '../cubit/reports_cubit.dart';
import '../cubit/reports_state.dart';

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() => _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _statusFilter = 'ALL'; // 'ALL', 'SUCCESS', 'VOID'

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _confirmVoid(BuildContext context, TransactionModel tx) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: AppColors.accentRose),
            const SizedBox(width: 8),
            const Text('Batalkan Nota (Void)?'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Nota: ${tx.invoiceNumber}'),
            Text('Total: ${CurrencyFormatter.format(tx.finalAmount)}'),
            const SizedBox(height: 12),
            const Text(
              'Perhatian: Jika nota dibatalkan, semua stok produk di dalam nota ini akan otomatis dikembalikan ke inventaris toko.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12.5),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Tutup'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRose),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final ok = await context.read<ReportsCubit>().voidTransaction(tx.id);
              if (context.mounted) {
                // Refresh inventory cubit as well to update stock view!
                context.read<InventoryCubit>().loadProducts();

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: ok ? AppColors.accentRose : AppColors.error,
                    content: Text(ok
                        ? 'Nota ${tx.invoiceNumber} dibatalkan & stok dikembalikan!'
                        : 'Gagal membatalkan nota.'),
                  ),
                );
              }
            },
            child: const Text('BATALKAN NOTA'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Transaksi & Nota'),
      ),
      body: BlocBuilder<ReportsCubit, ReportsState>(
        builder: (context, state) {
          final query = _searchController.text.trim().toLowerCase();
          var list = state.transactions.where((tx) {
            final matchQuery = tx.invoiceNumber.toLowerCase().contains(query) ||
                (tx.customerName?.toLowerCase().contains(query) ?? false);

            if (!matchQuery) return false;

            if (_statusFilter == 'SUCCESS') return !tx.isVoid;
            if (_statusFilter == 'VOID') return tx.isVoid;
            return true;
          }).toList();

          return Column(
            children: [
              // Search Field
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari nomor nota atau nama pelanggan...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),

              // Filter Chips
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  children: [
                    ChoiceChip(
                      selected: _statusFilter == 'ALL',
                      label: const Text('Semua Nota'),
                      onSelected: (_) => setState(() => _statusFilter = 'ALL'),
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      selected: _statusFilter == 'SUCCESS',
                      label: const Text('Berhasil'),
                      onSelected: (_) => setState(() => _statusFilter = 'SUCCESS'),
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      selected: _statusFilter == 'VOID',
                      label: const Text('Dibatalkan (Void)'),
                      onSelected: (_) => setState(() => _statusFilter = 'VOID'),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),

              // Transaction List
              Expanded(
                child: list.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.receipt_long_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'Tidak ada riwayat transaksi',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final tx = list[index];
                          return _buildTransactionCard(context, tx);
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTransactionCard(BuildContext context, TransactionModel tx) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => ReceiptPreviewScreen(transaction: tx),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row: Invoice & Status Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.receipt_rounded, size: 18, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text(
                        tx.invoiceNumber,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: tx.isVoid
                          ? AppColors.accentRose.withOpacity(0.12)
                          : AppColors.accentEmerald.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      tx.isVoid ? 'VOID (BATAL)' : tx.paymentMethod,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: tx.isVoid ? AppColors.accentRose : AppColors.accentEmerald,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // Date & Cashier
              Text(
                '${AppDateFormatter.formatDateTime(tx.createdAt)} • Kasir: ${tx.cashierName}',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 11.5),
              ),

              if (tx.customerName != null && tx.customerName!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    'Pelanggan: ${tx.customerName}',
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                  ),
                ),

              const Divider(height: 16),

              // Items Summary
              Text(
                tx.items.map((i) => '${i.productName} (${i.quantity.toInt()})').join(', '),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 8),

              // Bottom Row: Total & Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Total Belanja:',
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      ),
                      Text(
                        CurrencyFormatter.format(tx.finalAmount),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: tx.isVoid ? AppColors.textTertiary : AppColors.primaryDark,
                          decoration: tx.isVoid ? TextDecoration.lineThrough : null,
                        ),
                      ),
                    ],
                  ),

                  // Actions
                  Row(
                    children: [
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: const Size(0, 36),
                        ),
                        icon: const Icon(Icons.print_rounded, size: 16),
                        label: const Text('Struk', style: TextStyle(fontSize: 12)),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ReceiptPreviewScreen(transaction: tx),
                            ),
                          );
                        },
                      ),
                      if (!tx.isVoid) ...[
                        const SizedBox(width: 8),
                        IconButton(
                          tooltip: 'Batalkan Nota (Void)',
                          icon: const Icon(Icons.cancel_outlined, color: AppColors.accentRose, size: 20),
                          onPressed: () => _confirmVoid(context, tx),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
