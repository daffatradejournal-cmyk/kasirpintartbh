import 'dart:async';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:flutter/foundation.dart';

class PrinterDevice {
  final String name;
  final String address;
  final bool isConnected;

  PrinterDevice({
    required this.name,
    required this.address,
    this.isConnected = false,
  });
}

class PrinterService {
  static final PrinterService instance = PrinterService._internal();
  PrinterService._internal();

  final BlueThermalPrinter _bluetooth = BlueThermalPrinter.instance;
  bool _isConnected = false;
  BluetoothDevice? _connectedDevice;

  bool get isConnected => _isConnected;
  BluetoothDevice? get connectedDevice => _connectedDevice;

  /// Get paired devices list
  Future<List<BluetoothDevice>> getBondedDevices() async {
    try {
      final List<BluetoothDevice> devices = await _bluetooth.getBondedDevices();
      return devices;
    } catch (e) {
      debugPrint('Error getting bonded devices: $e');
      return [];
    }
  }

  /// Check connection status
  Future<bool> checkConnection() async {
    try {
      final isConn = await _bluetooth.isConnected ?? false;
      _isConnected = isConn;
      return isConn;
    } catch (_) {
      _isConnected = false;
      return false;
    }
  }

  /// Connect to bluetooth printer
  Future<bool> connect(BluetoothDevice device) async {
    try {
      await _bluetooth.connect(device);
      _isConnected = true;
      _connectedDevice = device;
      return true;
    } catch (e) {
      debugPrint('Connection error: $e');
      _isConnected = false;
      return false;
    }
  }

  /// Disconnect printer
  Future<void> disconnect() async {
    try {
      await _bluetooth.disconnect();
      _isConnected = false;
      _connectedDevice = null;
    } catch (e) {
      debugPrint('Disconnect error: $e');
    }
  }

  /// Print test receipt (58mm)
  Future<bool> printTestReceipt({
    required String storeName,
    required String storeAddress,
    required String cashierName,
  }) async {
    try {
      final isConn = await checkConnection();
      if (!isConn) return false;

      _bluetooth.printNewLine();
      _bluetooth.printCustom(storeName, 2, 1); // Size 2, Center
      _bluetooth.printCustom(storeAddress, 0, 1);
      _bluetooth.printCustom('--------------------------------', 0, 1);
      _bluetooth.printLeftRight('KASIR:', cashierName, 0);
      _bluetooth.printLeftRight('TANGGAL:', DateTime.now().toString().substring(0, 16), 0);
      _bluetooth.printCustom('--------------------------------', 0, 1);
      _bluetooth.printCustom('PRINTER THERMAL 58MM TERHUBUNG', 1, 1);
      _bluetooth.printCustom('InhilPOS Mobile - Berhasil Test', 0, 1);
      _bluetooth.printCustom('================================', 0, 1);
      _bluetooth.printNewLine();
      _bluetooth.printNewLine();
      _bluetooth.paperCut();
      return true;
    } catch (e) {
      debugPrint('Print test receipt error: $e');
      return false;
    }
  }

  /// Generate Receipt line format for 58mm (32 chars width)
  static String formatLine58mm(String left, String right) {
    const int totalWidth = 32;
    final int spaces = totalWidth - left.length - right.length;
    if (spaces <= 0) {
      return '$left $right';
    }
    return left + (' ' * spaces) + right;
  }
}
