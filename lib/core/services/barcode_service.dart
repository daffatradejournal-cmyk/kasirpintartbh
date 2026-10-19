import 'package:flutter/services.dart';

class BarcodeService {
  /// Trigger haptic feedback when a barcode is successfully detected
  static void triggerHapticSuccess() {
    HapticFeedback.mediumImpact();
  }

  /// Clean barcode string (remove trailing newline or control characters)
  static String sanitizeBarcode(String raw) {
    return raw.trim().replaceAll(RegExp(r'[\r\n\t]'), '');
  }

  /// Check if scanned code looks valid (EAN-13, EAN-8, UPC, Code-128, etc.)
  static bool isValidBarcode(String code) {
    if (code.isEmpty) return false;
    // Allow alphanumeric barcodes from 3 to 30 characters
    return code.length >= 3 && code.length <= 30;
  }
}
