import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/printer_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';
import '../../auth/models/store_profile_model.dart';
import '../models/transaction_model.dart';
import '../services/receipt_builder.dart';
import 'bluetooth_printer_modal.dart';

class ReceiptPreviewScreen extends StatelessWidget {
  final TransactionModel transaction;

  const ReceiptPreviewScreen({super.key, required this.transaction});

  StoreProfileModel _getStoreProfile(BuildContext context) {
    final state = context.read<AuthCubit>().state;
    if (state is AuthLoaded) {
      return state.profile;
    }
    return const StoreProfileModel(
      storeName: AppConstants.defaultStoreName,
      address: AppConstants.defaultStoreAddress,
      phone: AppConstants.defaultStorePhone,
      receiptFooter: AppConstants.defaultReceiptFooter,
      activeCashier: AppConstants.defaultCashierName,
    );
  }

  void _printViaBluetooth(BuildContext context) async {
    final store = _getStoreProfile(context);
    final isConnected = await PrinterService.instance.checkConnection();

    if (!isConnected) {
      if (context.mounted) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          builder: (_) => const BluetoothPrinterModal(),
        );
      }
      return;
    }

    final plainText = ReceiptBuilder.buildPlainText58mm(
      transaction: transaction,
      store: store,
    );

    // Send formatted raw bytes / custom print to bluetooth printer
    try {
      final bluetooth = PrinterService.instance;
      // Print header
      await bluetooth.printTestReceipt(
        storeName: store.storeName,
        storeAddress: store.address,
        cashierName: transaction.cashierName,
      );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppColors.success,
            content: Text('Struk berhasil dikirim ke printer Bluetooth!'),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.error,
            content: Text('Gagal mencetak: $e'),
          ),
        );
      }
    }
  }

  void _shareViaWhatsApp(BuildContext context) async {
    final store = _getStoreProfile(context);
    final text = ReceiptBuilder.buildWhatsAppMessage(
      transaction: transaction,
      store: store,
    );

    // If customer phone is known, open WhatsApp directly
    final phone = transaction.customerPhone?.replaceAll(RegExp(r'[^0-9]'), '');
    if (phone != null && phone.isNotEmpty) {
      String cleanPhone = phone;
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62${cleanPhone.substring(1)}';
      }
      final uri = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent(text)}');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        return;
      }
    }

    // Otherwise use native Share dialog
    await Share.share(text, subject: 'Struk Belanja ${transaction.invoiceNumber}');
  }

  @override
  Widget build(BuildContext context) {
    final store = _getStoreProfile(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Nota & Struk Belanja'),
        actions: [
          IconButton(
            tooltip: 'Printer Bluetooth',
            icon: const Icon(Icons.print_rounded, color: AppColors.primary),
            onPressed: () => _printViaBluetooth(context),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            // WhatsApp E-Receipt Button
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF25D366),
                  side: const BorderSide(color: Color(0xFF25D366), width: 1.5),
                ),
                icon: const Icon(Icons.share_rounded),
                label: const Text('Kirim WA'),
                onPressed: () => _shareViaWhatsApp(context),
              ),
            ),
            const SizedBox(width: 12),

            // Print Bluetooth Thermal Button
            Expanded(
              flex: 2,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                ),
                icon: const Icon(Icons.print_rounded),
                label: const Text('CETAK BLUETOOTH'),
                onPressed: () => _printViaBluetooth(context),
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        child: Column(
          children: [
            // Success Confirmation Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primaryContainer.withOpacity(0.6),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primaryLight),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: AppColors.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Transaksi Berhasil Disimpan!',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                            color: AppColors.primaryDark,
                          ),
                        ),
                        Text(
                          'Stok otomatis terpotong • Siap cetak / kirim WA',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: AppColors.primaryDark.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Realistic Paper Receipt Simulation
            Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 380),
                decoration: BoxDecoration(
                  color: AppColors.surfaceCream,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(color: AppColors.cashKeyBorder),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Store Header
                    Text(
                      store.storeName.toUpperCase(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      store.address,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (store.phone.isNotEmpty)
                      Text(
                        'Telp: ${store.phone}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        '----------------------------------------',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontFamily: 'monospace', color: AppColors.textTertiary),
                      ),
                    ),

                    // Meta Info
                    _buildReceiptRow('No. Nota', transaction.invoiceNumber),
                    _buildReceiptRow('Tanggal', AppDateFormatter.formatDateTime(transaction.createdAt)),
                    _buildReceiptRow('Kasir', transaction.cashierName),
                    if (transaction.customerName != null && transaction.customerName!.isNotEmpty)
                      _buildReceiptRow('Pelanggan', transaction.customerName!),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        '----------------------------------------',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontFamily: 'monospace', color: AppColors.textTertiary),
                      ),
                    ),

                    // Item List
                    ...transaction.items.map((item) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.productName,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '  ${item.quantity.toInt()} x ${CurrencyFormatter.format(item.sellPrice)}',
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                Text(
                                  CurrencyFormatter.format(item.subtotal),
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12.5,
                                  ),
                                ),
                              ],
                            ),
                            if (item.discount > 0)
                              Padding(
                                padding: const EdgeInsets.only(left: 8),
                                child: Text(
                                  'Diskon: -${CurrencyFormatter.format(item.discount)}',
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 11,
                                    color: AppColors.accentRose,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        '----------------------------------------',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontFamily: 'monospace', color: AppColors.textTertiary),
                      ),
                    ),

                    // Totals
                    _buildReceiptRow('Total Belanja', CurrencyFormatter.format(transaction.totalAmount)),
                    if (transaction.discountAmount > 0)
                      _buildReceiptRow(
                        'Diskon Nota',
                        '-${CurrencyFormatter.format(transaction.discountAmount)}',
                        textColor: AppColors.accentRose,
                      ),
                    const SizedBox(height: 4),
                    _buildReceiptRow(
                      'TOTAL AKHIR',
                      CurrencyFormatter.format(transaction.finalAmount),
                      isBold: true,
                      fontSize: 15,
                    ),
                    const SizedBox(height: 4),
                    _buildReceiptRow('Metode Bayar', transaction.paymentMethod),
                    _buildReceiptRow('Tunai Diterima', CurrencyFormatter.format(transaction.paidAmount)),
                    _buildReceiptRow(
                      'Kembalian',
                      CurrencyFormatter.format(transaction.changeAmount),
                      isBold: true,
                    ),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        '========================================',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontFamily: 'monospace', color: AppColors.textTertiary),
                      ),
                    ),

                    // Receipt Footer
                    Text(
                      store.receiptFooter,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'InhilPOS Mobile • Daffa (UNISI)',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Actions: New Transaction Button & PDF Button
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.picture_as_pdf_rounded),
                    label: const Text('Cetak PDF'),
                    onPressed: () => ReceiptBuilder.printPdfReceipt(
                      transaction: transaction,
                      store: store,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryDark,
                    ),
                    icon: const Icon(Icons.add_shopping_cart_rounded),
                    label: const Text('TRANSAKSI BARU'),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value,
      {bool isBold = false, double fontSize = 12, Color? textColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: fontSize,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: textColor ?? AppColors.textPrimary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: fontSize,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
              color: textColor ?? AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
