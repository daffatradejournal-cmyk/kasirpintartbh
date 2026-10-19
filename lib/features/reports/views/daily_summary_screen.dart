import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../cubit/reports_cubit.dart';
import '../cubit/reports_state.dart';
import 'transaction_history_screen.dart';

class DailySummaryScreen extends StatefulWidget {
  const DailySummaryScreen({super.key});

  @override
  State<DailySummaryScreen> createState() => _DailySummaryScreenState();
}

class _DailySummaryScreenState extends State<DailySummaryScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ReportsCubit>().loadReports();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan & Analitik Penjualan'),
        actions: [
          IconButton(
            tooltip: 'Riwayat Nota',
            icon: const Icon(Icons.receipt_long_rounded, color: AppColors.primary),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const TransactionHistoryScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Segarkan',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => context.read<ReportsCubit>().loadReports(),
          ),
        ],
      ),
      body: BlocBuilder<ReportsCubit, ReportsState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: () => context.read<ReportsCubit>().loadReports(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Filter Segmented Controls
                  _buildFilterSegments(context, state),
                  const SizedBox(height: 16),

                  // Date Banner
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        state.dateFilterType == 'TODAY'
                            ? 'Rekap: ${AppDateFormatter.formatDate(state.selectedDate)}'
                            : state.dateFilterType == 'WEEK'
                                ? 'Rekap 7 Hari Terakhir'
                                : 'Rekap Bulan Ini',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.history_rounded, size: 18),
                        label: const Text('Lihat Semua Nota'),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const TransactionHistoryScreen()),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Key Financial Cards (Omzet & Laba Bersih)
                  Row(
                    children: [
                      // Omzet Kotor Card
                      Expanded(
                        child: _buildMetricCard(
                          context,
                          title: 'Omzet Kotor',
                          value: CurrencyFormatter.format(state.grossRevenue),
                          icon: Icons.storefront_rounded,
                          color: AppColors.primary,
                          bgColor: AppColors.primaryContainer.withOpacity(0.5),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Laba Bersih Card
                      Expanded(
                        child: _buildMetricCard(
                          context,
                          title: 'Laba Bersih',
                          value: CurrencyFormatter.format(state.netProfit),
                          icon: Icons.trending_up_rounded,
                          color: AppColors.accentEmerald,
                          bgColor: AppColors.accentEmerald.withOpacity(0.12),
                          subtitle: 'Harga Jual - Modal',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Secondary Cards (Transaksi & Payment Breakdown)
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          context,
                          title: 'Total Transaksi',
                          value: '${state.totalTransactions} Nota',
                          icon: Icons.receipt_rounded,
                          color: AppColors.secondary,
                          bgColor: AppColors.secondaryContainer.withOpacity(0.5),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildPaymentBreakdownCard(context, state),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Top 5 Best Sellers Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Produk Terlaris (Top 5 Best Seller)',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryDark,
                            ),
                      ),
                      const Icon(Icons.emoji_events_rounded, color: Colors.amber),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (state.bestSellers.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: const Center(
                        child: Text(
                          'Belum ada data penjualan pada periode ini.',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    ...state.bestSellers.asMap().entries.map((entry) {
                      final index = entry.key;
                      final item = entry.value;
                      final highestQty = state.bestSellers.first.totalQty;
                      final progress = highestQty > 0 ? (item.totalQty / highestQty) : 0.0;

                      return _buildBestSellerRow(context, index + 1, item, progress);
                    }),

                  const SizedBox(height: 28),

                  // Quick Action to View Nota
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.receipt_long_rounded),
                      label: const Text('BUKA RIWAYAT & CETAK ULANG NOTA'),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const TransactionHistoryScreen()),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterSegments(BuildContext context, ReportsState state) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          _buildFilterButton('Hari Ini', 'TODAY', state.dateFilterType),
          _buildFilterButton('7 Hari', 'WEEK', state.dateFilterType),
          _buildFilterButton('Bulan Ini', 'MONTH', state.dateFilterType),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, String type, String currentType) {
    final isSelected = type == currentType;
    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () => context.read<ReportsCubit>().setDateFilter(type),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
              fontSize: 12.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required Color bgColor,
    String? subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 10.5, color: AppColors.textTertiary),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentBreakdownCard(BuildContext context, ReportsState state) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Metode Pembayaran',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('💵 Tunai:', style: TextStyle(fontSize: 11)),
              Text(
                CurrencyFormatter.format(state.cashTotal),
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('📱 QRIS:', style: TextStyle(fontSize: 11)),
              Text(
                CurrencyFormatter.format(state.nonCashTotal),
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.secondary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBestSellerRow(BuildContext context, int rank, BestSellerItem item, double progress) {
    Color rankColor = AppColors.primary;
    if (rank == 1) rankColor = Colors.amber.shade700;
    if (rank == 2) rankColor = Colors.grey.shade600;
    if (rank == 3) rankColor = Colors.brown.shade400;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 12,
                backgroundColor: rankColor.withOpacity(0.15),
                child: Text(
                  '#$rank',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: rankColor,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  item.productName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                '${item.totalQty} terjual',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0.05, 1.0),
              minHeight: 6,
              backgroundColor: AppColors.borderSubtle,
              valueColor: AlwaysStoppedAnimation<Color>(rankColor),
            ),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Omzet: ${CurrencyFormatter.format(item.totalRevenue)}',
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
