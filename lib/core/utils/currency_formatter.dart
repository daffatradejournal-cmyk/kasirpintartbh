import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _formatter = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  static final NumberFormat _compactFormatter = NumberFormat.compactCurrency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  /// Format double or int into Indonesian Rupiah e.g. "Rp 25.000"
  static String format(num? amount) {
    if (amount == null) return 'Rp 0';
    return _formatter.format(amount);
  }

  /// Compact format e.g. "Rp 2,5 jt"
  static String formatCompact(num? amount) {
    if (amount == null) return 'Rp 0';
    return _compactFormatter.format(amount);
  }

  /// Parse text input with numbers/dots into num
  static double parse(String input) {
    final clean = input.replaceAll(RegExp(r'[^0-9]'), '');
    return double.tryParse(clean) ?? 0.0;
  }
}
