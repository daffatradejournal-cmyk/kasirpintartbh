import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';
import '../../receipt/views/receipt_preview_screen.dart';
import '../cubit/pos_cubit.dart';
import '../cubit/pos_state.dart';

class PaymentDialog extends StatefulWidget {
  const PaymentDialog({super.key});

  @override
  State<PaymentDialog> createState() => _PaymentDialogState();
}

class _PaymentDialogState extends State<PaymentDialog> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _cashController = TextEditingController();
  double _paidAmount = 0.0;
  String _selectedMethod = 'CASH';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 0) {
        setState(() => _selectedMethod = 'CASH');
      } else {
        setState(() => _selectedMethod = 'QRIS');
      }
    });

    final posState = context.read<PosCubit>().state;
    _paidAmount = posState.finalTotal;
    _cashController.text = posState.finalTotal.toInt().toString();

    _cashController.addListener(() {
      setState(() {
        _paidAmount = CurrencyFormatter.parse(_cashController.text);
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _cashController.dispose();
    super.dispose();
  }

  void _setExactCash(double total) {
    setState(() {
      _paidAmount = total;
      _cashController.text = total.toInt().toString();
    });
  }

  void _addCash(int amount) {
    setState(() {
      _paidAmount += amount;
      _cashController.text = _paidAmount.toInt().toString();
    });
  }

  void _setDirectCash(int amount) {
    setState(() {
      _paidAmount = amount.toDouble();
      _cashController.text = amount.toString();
    });
  }

  void _submitPayment(BuildContext context, PosState posState) async {
    final authState = context.read<AuthCubit>().state;
    String cashierName = AppConstants.defaultCashierName;
    if (authState is AuthLoaded) {
      cashierName = authState.profile.activeCashier;
    }

    final posCubit = context.read<PosCubit>();
    posCubit.setPaymentMethod(_selectedMethod);

    // If Non-cash, paid amount is exact total
    final finalPaid = _selectedMethod == 'CASH' ? _paidAmount : posState.finalTotal;

    final success = await posCubit.processCheckout(
      paidAmount: finalPaid,
      cashierName: cashierName,
    );

    if (!mounted) return;

    if (success) {
      final completed = posCubit.state.completedTransaction;
      Navigator.of(context).pop(); // Close Payment Dialog

      if (completed != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ReceiptPreviewScreen(transaction: completed),
          ),
        );
      }
    } else {
      final err = posCubit.state.errorMessage ?? 'Gagal memproses pembayaran';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.error, content: Text(err)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PosCubit, PosState>(
      builder: (context, posState) {
        final total = posState.finalTotal;
        final change = _paidAmount - total;
        final isSufficient = _paidAmount >= total;

        return Dialog(
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480, maxHeight: 680),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 16, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Pembayaran Kasir',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),

                // Method Tabs
                TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.primary,
                  labelColor: AppColors.primary,
                  unselectedLabelColor: AppColors.textSecondary,
                  tabs: const [
                    Tab(icon: Icon(Icons.payments_rounded), text: 'Tunai (Cash)'),
                    Tab(icon: Icon(Icons.qr_code_2_rounded), text: 'Non-Tunai (QRIS)'),
                  ],
                ),

                // Tab Content
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      // Tab 1: CASH PAYMENT
                      _buildCashTab(context, total, change, isSufficient),

                      // Tab 2: QRIS / NON-CASH
                      _buildQrisTab(context, total),
                    ],
                  ),
                ),

                // Checkout Confirmation CTA
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: AppColors.surface,
                    border: Border(top: BorderSide(color: AppColors.border)),
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isSufficient || _selectedMethod != 'CASH'
                            ? AppColors.primary
                            : Colors.grey.shade400,
                      ),
                      icon: const Icon(Icons.check_circle_rounded),
                      label: Text(
                        posState.isCheckingOut
                            ? 'MEMPROSES TRANSAKSI...'
                            : 'KONFIRMASI BAYAR (${CurrencyFormatter.format(total)})',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      onPressed: (!isSufficient && _selectedMethod == 'CASH') || posState.isCheckingOut
                          ? null
                          : () => _submitPayment(context, posState),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCashTab(BuildContext context, double total, double change, bool isSufficient) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Total Amount Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primaryContainer.withOpacity(0.5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primaryLight),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Tagihan:',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5),
                ),
                Text(
                  CurrencyFormatter.format(total),
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    color: AppColors.primaryDark,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Cash Received Input
          TextField(
            controller: _cashController,
            keyboardType: TextInputType.number,
            autofocus: false,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            decoration: const InputDecoration(
              labelText: 'Uang Diterima dari Pembeli',
              prefixText: 'Rp ',
              prefixStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              prefixIcon: Icon(Icons.account_balance_wallet_rounded),
            ),
          ),
          const SizedBox(height: 12),

          // Tactile Quick Denomination Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    backgroundColor: AppColors.primaryContainer.withOpacity(0.3),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: () => _setExactCash(total),
                  child: const Text('Uang Pas', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                  onPressed: () => _setDirectCash(50000),
                  child: const Text('50 Ribu', style: TextStyle(fontSize: 13)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                  onPressed: () => _setDirectCash(100000),
                  child: const Text('100 Ribu', style: TextStyle(fontSize: 13)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                  onPressed: () => _addCash(10000),
                  child: const Text('+10.000', style: TextStyle(fontSize: 13)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                  onPressed: () => _addCash(20000),
                  child: const Text('+20.000', style: TextStyle(fontSize: 13)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                  onPressed: () => _addCash(50000),
                  child: const Text('+50.000', style: TextStyle(fontSize: 13)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Change Display Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSufficient
                  ? AppColors.accentEmerald.withOpacity(0.12)
                  : AppColors.accentRose.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSufficient ? AppColors.accentEmerald : AppColors.accentRose,
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isSufficient ? 'Uang Kembalian:' : 'Uang Masih Kurang:',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: isSufficient ? AppColors.success : AppColors.accentRose,
                      ),
                    ),
                    Text(
                      isSufficient ? 'Kembalikan ke pelanggan' : 'Minta tambahan uang dari pembeli',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                Text(
                  CurrencyFormatter.format(change.abs()),
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: isSufficient ? AppColors.success : AppColors.accentRose,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrisTab(BuildContext context, double total) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.secondaryContainer.withOpacity(0.5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.secondary),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Nominal QRIS Dinamis:', style: TextStyle(fontWeight: FontWeight.w600)),
                Text(
                  CurrencyFormatter.format(total),
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    color: AppColors.secondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // QR Code Card Simulator
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Image.network(
                  'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226680016ID.CO.QRIS.WWW0118936009990000000000520458125303360540${total.toInt()}5802ID5919InhilPOS%20Merchant6011TEMBILAHAN6304',
                  width: 170,
                  height: 170,
                  errorBuilder: (_, __, ___) => Container(
                    width: 170,
                    height: 170,
                    color: Colors.grey.shade100,
                    child: const Icon(Icons.qr_code_2_rounded, size: 100, color: AppColors.primary),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'QRIS Standar Bank Indonesia',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const Text(
                  'Bisa di-scan GoPay, OVO, Dana, BCA, Mandiri, BRI, dll.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Tekan tombol konfirmasi di bawah setelah pembeli menunjukkan bukti transfer/sukses scan.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
