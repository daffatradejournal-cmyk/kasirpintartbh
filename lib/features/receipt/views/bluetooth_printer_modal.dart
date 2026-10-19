import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/printer_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/cubit/auth_cubit.dart';
import '../../auth/cubit/auth_state.dart';

class BluetoothPrinterModal extends StatefulWidget {
  const BluetoothPrinterModal({super.key});

  @override
  State<BluetoothPrinterModal> createState() => _BluetoothPrinterModalState();
}

class _BluetoothPrinterModalState extends State<BluetoothPrinterModal> {
  List<BluetoothDevice> _devices = [];
  bool _isLoading = false;
  BluetoothDevice? _selectedDevice;
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    _initPrinter();
  }

  Future<void> _initPrinter() async {
    setState(() => _isLoading = true);
    final isConn = await PrinterService.instance.checkConnection();
    final devices = await PrinterService.instance.getBondedDevices();

    setState(() {
      _isConnected = isConn;
      _selectedDevice = PrinterService.instance.connectedDevice;
      _devices = devices;
      _isLoading = false;
    });
  }

  Future<void> _connect(BluetoothDevice device) async {
    setState(() => _isLoading = true);
    final ok = await PrinterService.instance.connect(device);

    setState(() {
      _isConnected = ok;
      _selectedDevice = ok ? device : null;
      _isLoading = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: ok ? AppColors.success : AppColors.error,
          content: Text(ok
              ? 'Terhubung ke ${device.name ?? "Printer Thermal"}'
              : 'Gagal menghubungkan. Pastikan printer menyala & Bluetooth aktif.'),
        ),
      );
    }
  }

  Future<void> _disconnect() async {
    setState(() => _isLoading = true);
    await PrinterService.instance.disconnect();
    setState(() {
      _isConnected = false;
      _selectedDevice = null;
      _isLoading = false;
    });
  }

  Future<void> _testPrint() async {
    final authState = context.read<AuthCubit>().state;
    String storeName = 'InhilPOS Toko';
    String address = 'Tembilahan, Indragiri Hilir';
    String cashier = 'Kasir 01';

    if (authState is AuthLoaded) {
      storeName = authState.profile.storeName;
      address = authState.profile.address;
      cashier = authState.profile.activeCashier;
    }

    final ok = await PrinterService.instance.printTestReceipt(
      storeName: storeName,
      storeAddress: address,
      cashierName: cashier,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: ok ? AppColors.success : AppColors.warning,
          content: Text(ok
              ? 'Struk uji coba berhasil dicetak!'
              : 'Gagal mencetak struk uji coba. Periksa koneksi printer.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.print_rounded, color: AppColors.primary),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Printer Thermal Bluetooth',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded),
                onPressed: _isLoading ? null : _initPrinter,
                tooltip: 'Pindai Ulang',
              ),
            ],
          ),
          const Divider(height: 24),

          // Current Connection Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: _isConnected
                  ? AppColors.primaryContainer.withOpacity(0.5)
                  : AppColors.borderSubtle,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _isConnected ? AppColors.primary : AppColors.border,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  _isConnected ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                  color: _isConnected ? AppColors.primary : AppColors.textSecondary,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _isConnected
                        ? 'Terhubung: ${_selectedDevice?.name ?? "Printer Thermal 58mm"}'
                        : 'Belum terhubung ke printer Bluetooth.',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: _isConnected ? AppColors.primaryDark : AppColors.textPrimary,
                    ),
                  ),
                ),
                if (_isConnected)
                  TextButton(
                    onPressed: _disconnect,
                    child: const Text('Putus', style: TextStyle(color: AppColors.error)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Test Print Button
          if (_isConnected)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.secondary,
                ),
                icon: const Icon(Icons.receipt_long_rounded),
                label: const Text('CETAK STRUK UJI COBA (TEST PRINT)'),
                onPressed: _testPrint,
              ),
            ),
          if (_isConnected) const SizedBox(height: 16),

          const Text(
            'Perangkat Bluetooth Terpasang (Paired Devices):',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),

          // List of Devices
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _devices.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.bluetooth_searching_rounded,
                                size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 10),
                            const Text(
                              'Tidak ada printer bluetooth terdeteksi.',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 24),
                              child: Text(
                                'Pastikan printer thermal dinyalakan dan sudah di-pair di pengaturan Bluetooth HP Android Anda.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: _devices.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final device = _devices[index];
                          final isCurrent = _selectedDevice?.address == device.address && _isConnected;

                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isCurrent ? AppColors.primaryContainer : AppColors.borderSubtle,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.print_rounded,
                                color: isCurrent ? AppColors.primary : AppColors.textSecondary,
                              ),
                            ),
                            title: Text(
                              device.name ?? 'Perangkat Tanpa Nama',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            subtitle: Text(
                              device.address ?? 'MAC: Tidak diketahui',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                            trailing: isCurrent
                                ? const Chip(
                                    label: Text('Aktif', style: TextStyle(fontSize: 11, color: Colors.white)),
                                    backgroundColor: AppColors.primary,
                                  )
                                : OutlinedButton(
                                    onPressed: () => _connect(device),
                                    child: const Text('Hubungkan'),
                                  ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
