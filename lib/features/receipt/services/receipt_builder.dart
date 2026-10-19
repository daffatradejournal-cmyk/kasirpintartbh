import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../auth/models/store_profile_model.dart';
import '../models/transaction_model.dart';

class ReceiptBuilder {
  /// Generate Plain Text Receipt for 58mm Thermal Bluetooth Printer (32 characters width)
  static String buildPlainText58mm({
    required TransactionModel transaction,
    required StoreProfileModel store,
  }) {
    final buffer = StringBuffer();
    const int width = 32;

    String center(String text) {
      if (text.length >= width) return text.substring(0, width);
      final pad = (width - text.length) ~/ 2;
      return ' ' * pad + text;
    }

    String twoCol(String left, String right) {
      final available = width - right.length;
      if (left.length > available) {
        left = left.substring(0, available - 1);
      }
      final spaces = width - left.length - right.length;
      return left + (' ' * (spaces > 0 ? spaces : 1)) + right;
    }

    buffer.writeln(center(store.storeName.toUpperCase()));
    buffer.writeln(center(store.address));
    if (store.phone.isNotEmpty) {
      buffer.writeln(center('Telp: ${store.phone}'));
    }
    buffer.writeln('-' * width);

    buffer.writeln(twoCol('No Nota:', transaction.invoiceNumber));
    buffer.writeln(twoCol('Tgl:', AppDateFormatter.formatDateTime(transaction.createdAt)));
    buffer.writeln(twoCol('Kasir:', transaction.cashierName));
    if (transaction.customerName != null && transaction.customerName!.isNotEmpty) {
      buffer.writeln(twoCol('Pelanggan:', transaction.customerName!));
    }
    buffer.writeln('-' * width);

    // Items
    for (final item in transaction.items) {
      buffer.writeln(item.productName);
      final qtyPrice = '${item.quantity.toInt()} x ${CurrencyFormatter.format(item.sellPrice)}';
      final subtotal = CurrencyFormatter.format(item.subtotal);
      buffer.writeln(twoCol('  $qtyPrice', subtotal));
      if (item.discount > 0) {
        buffer.writeln(twoCol('  Diskon:', '-${CurrencyFormatter.format(item.discount)}'));
      }
    }
    buffer.writeln('-' * width);

    // Totals
    buffer.writeln(twoCol('Total Belanja:', CurrencyFormatter.format(transaction.totalAmount)));
    if (transaction.discountAmount > 0) {
      buffer.writeln(twoCol('Diskon Nota:', '-${CurrencyFormatter.format(transaction.discountAmount)}'));
    }
    buffer.writeln(twoCol('Total Akhir:', CurrencyFormatter.format(transaction.finalAmount)));
    buffer.writeln(twoCol('Metode Bayar:', transaction.paymentMethod));
    buffer.writeln(twoCol('Diterima:', CurrencyFormatter.format(transaction.paidAmount)));
    buffer.writeln(twoCol('Kembalian:', CurrencyFormatter.format(transaction.changeAmount)));

    buffer.writeln('=' * width);
    buffer.writeln(center(store.receiptFooter));
    buffer.writeln('\n\n');

    return buffer.toString();
  }

  /// Generate WhatsApp Friendly E-Receipt Text
  static String buildWhatsAppMessage({
    required TransactionModel transaction,
    required StoreProfileModel store,
  }) {
    final buffer = StringBuffer();

    buffer.writeln('🧾 *STRUK PEMBELIAN - ${store.storeName.toUpperCase()}*');
    buffer.writeln('📍 ${store.address}');
    if (store.phone.isNotEmpty) buffer.writeln('📞 ${store.phone}');
    buffer.writeln('--------------------------------');
    buffer.writeln('No. Nota : *${transaction.invoiceNumber}*');
    buffer.writeln('Tanggal  : ${AppDateFormatter.formatDateTime(transaction.createdAt)}');
    buffer.writeln('Kasir    : ${transaction.cashierName}');
    if (transaction.customerName != null && transaction.customerName!.isNotEmpty) {
      buffer.writeln('Pelanggan: ${transaction.customerName}');
    }
    buffer.writeln('--------------------------------');

    for (final item in transaction.items) {
      buffer.writeln('*${item.productName}*');
      buffer.writeln('  ${item.quantity.toInt()} x ${CurrencyFormatter.format(item.sellPrice)} = *${CurrencyFormatter.format(item.subtotal)}*');
      if (item.discount > 0) {
        buffer.writeln('  Diskon: -${CurrencyFormatter.format(item.discount)}');
      }
    }

    buffer.writeln('--------------------------------');
    buffer.writeln('Subtotal      : ${CurrencyFormatter.format(transaction.totalAmount)}');
    if (transaction.discountAmount > 0) {
      buffer.writeln('Diskon Nota   : -${CurrencyFormatter.format(transaction.discountAmount)}');
    }
    buffer.writeln('💰 *TOTAL AKHIR : ${CurrencyFormatter.format(transaction.finalAmount)}*');
    buffer.writeln('Metode Bayar  : ${transaction.paymentMethod}');
    buffer.writeln('Tunai Diterima: ${CurrencyFormatter.format(transaction.paidAmount)}');
    buffer.writeln('Kembalian     : *${CurrencyFormatter.format(transaction.changeAmount)}*');
    buffer.writeln('================================');
    buffer.writeln(store.receiptFooter);
    buffer.writeln('\n_Struk digital resmi diterbitkan oleh InhilPOS Mobile._');

    return buffer.toString();
  }

  /// Generate PDF Receipt for standard printing
  static Future<void> printPdfReceipt({
    required TransactionModel transaction,
    required StoreProfileModel store,
  }) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.roll57,
        margin: const pw.EdgeInsets.all(6),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              pw.Text(
                store.storeName,
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11),
                textAlign: pw.TextAlign.center,
              ),
              pw.Text(store.address, style: const pw.TextStyle(fontSize: 7), textAlign: pw.TextAlign.center),
              pw.Divider(thickness: 0.5),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('No:', style: const pw.TextStyle(fontSize: 7)),
                  pw.Text(transaction.invoiceNumber, style: const pw.TextStyle(fontSize: 7)),
                ],
              ),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Tgl:', style: const pw.TextStyle(fontSize: 7)),
                  pw.Text(AppDateFormatter.formatDateTime(transaction.createdAt), style: const pw.TextStyle(fontSize: 7)),
                ],
              ),
              pw.Divider(thickness: 0.5),
              ...transaction.items.map((it) {
                return pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(it.productName, style: const pw.TextStyle(fontSize: 8)),
                    pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text('${it.quantity.toInt()} x ${CurrencyFormatter.format(it.sellPrice)}',
                            style: const pw.TextStyle(fontSize: 7)),
                        pw.Text(CurrencyFormatter.format(it.subtotal),
                            style: const pw.TextStyle(fontSize: 7)),
                      ],
                    ),
                  ],
                );
              }),
              pw.Divider(thickness: 0.5),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Total:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8)),
                  pw.Text(CurrencyFormatter.format(transaction.finalAmount),
                      style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8)),
                ],
              ),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Kembalian:', style: const pw.TextStyle(fontSize: 7)),
                  pw.Text(CurrencyFormatter.format(transaction.changeAmount), style: const pw.TextStyle(fontSize: 7)),
                ],
              ),
              pw.SizedBox(height: 10),
              pw.Text(store.receiptFooter, style: const pw.TextStyle(fontSize: 6), textAlign: pw.TextAlign.center),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => pdf.save());
  }
}
