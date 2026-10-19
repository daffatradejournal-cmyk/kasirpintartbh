import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/sync_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../receipt/views/bluetooth_printer_modal.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../models/store_profile_model.dart';

class StoreProfileScreen extends StatefulWidget {
  const StoreProfileScreen({super.key});

  @override
  State<StoreProfileScreen> createState() => _StoreProfileScreenState();
}

class _StoreProfileScreenState extends State<StoreProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _addressController;
  late TextEditingController _phoneController;
  late TextEditingController _footerController;
  late TextEditingController _cashierController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _addressController = TextEditingController();
    _phoneController = TextEditingController();
    _footerController = TextEditingController();
    _cashierController = TextEditingController();

    final state = context.read<AuthCubit>().state;
    if (state is AuthLoaded) {
      _populateFields(state.profile);
    }
  }

  void _populateFields(StoreProfileModel profile) {
    _nameController.text = profile.storeName;
    _addressController.text = profile.address;
    _phoneController.text = profile.phone;
    _footerController.text = profile.receiptFooter;
    _cashierController.text = profile.activeCashier;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _footerController.dispose();
    _cashierController.dispose();
    super.dispose();
  }

  void _saveProfile() {
    if (_formKey.currentState!.validate()) {
      final updated = StoreProfileModel(
        storeName: _nameController.text.trim(),
        address: _addressController.text.trim(),
        phone: _phoneController.text.trim(),
        receiptFooter: _footerController.text.trim(),
        activeCashier: _cashierController.text.trim(),
      );

      context.read<AuthCubit>().updateProfile(updated);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.success,
          content: Text('Profil toko & kasir berhasil disimpan!'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pengaturan & Profil Toko'),
        actions: [
          IconButton(
            tooltip: 'Simpan Perubahan',
            icon: const Icon(Icons.check_circle_rounded, color: AppColors.primary),
            onPressed: _saveProfile,
          ),
        ],
      ),
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthLoaded && _nameController.text.isEmpty) {
            _populateFields(state.profile);
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hardware & Sync Quick Action Cards
                  _buildQuickActionCards(context),
                  const SizedBox(height: 20),

                  // Store Info Card
                  Text(
                    'Identitas Toko & Struk',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          TextFormField(
                            controller: _nameController,
                            decoration: const InputDecoration(
                              labelText: 'Nama Usaha / Toko',
                              prefixIcon: Icon(Icons.storefront_rounded),
                              hintText: 'Contoh: Toko Berkah Mandiri',
                            ),
                            validator: (v) => v!.isEmpty ? 'Nama toko wajib diisi' : null,
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _addressController,
                            maxLines: 2,
                            decoration: const InputDecoration(
                              labelText: 'Alamat Lengkap Toko',
                              prefixIcon: Icon(Icons.location_on_rounded),
                              hintText: 'Jl. M. Boya, Tembilahan, Indragiri Hilir',
                            ),
                            validator: (v) => v!.isEmpty ? 'Alamat wajib diisi' : null,
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            decoration: const InputDecoration(
                              labelText: 'Nomor HP / WhatsApp Toko',
                              prefixIcon: Icon(Icons.phone_rounded),
                              hintText: '0812-xxxx-xxxx',
                            ),
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _footerController,
                            maxLines: 2,
                            decoration: const InputDecoration(
                              labelText: 'Catatan Kaki Struk (Receipt Footer)',
                              prefixIcon: Icon(Icons.receipt_long_rounded),
                              hintText: 'Ucapan terima kasih atau ketentuan garansi',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Cashier Info
                  Text(
                    'Petugas Kasir Bertugas',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: TextFormField(
                        controller: _cashierController,
                        decoration: const InputDecoration(
                          labelText: 'Nama Kasir Aktif',
                          prefixIcon: Icon(Icons.badge_rounded),
                          hintText: 'Contoh: Kasir Daffa',
                        ),
                        validator: (v) => v!.isEmpty ? 'Nama kasir wajib diisi' : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.save_rounded),
                      label: const Text('SIMPAN PERUBAHAN TOKO'),
                      onPressed: _saveProfile,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Developer Credit Banner
                  _buildDeveloperCard(context),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActionCards(BuildContext context) {
    return Row(
      children: [
        // Bluetooth Printer Setup
        Expanded(
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const BluetoothPrinterModal(),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.secondaryContainer,
                    child: Icon(Icons.print_rounded, color: AppColors.secondary),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'Printer Bluetooth',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                  ),
                  Text(
                    'Hubungkan thermal 58mm',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),

        // Cloud Sync Card
        Expanded(
          child: StreamBuilder<SyncReport>(
            stream: SyncService.instance.syncStream,
            initialData: SyncService.instance.currentReport,
            builder: (context, snapshot) {
              final report = snapshot.data;
              final isSyncing = report?.status == SyncStatus.syncing;
              final pending = report?.pendingCount ?? 0;

              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: isSyncing
                    ? null
                    : () async {
                        final ok = await SyncService.instance.synchronize();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: ok ? AppColors.success : AppColors.warning,
                              content: Text(ok
                                  ? 'Sinkronisasi berhasil diselesaikan!'
                                  : 'Gagal sync. Transaksi aman tersimpan offline.'),
                            ),
                          );
                        }
                      },
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        backgroundColor: pending > 0
                            ? AppColors.primaryContainer
                            : AppColors.secondaryContainer,
                        child: isSyncing
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Icon(
                                pending > 0
                                    ? Icons.cloud_upload_rounded
                                    : Icons.cloud_done_rounded,
                                color: pending > 0 ? AppColors.primary : AppColors.success,
                              ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        isSyncing ? 'Menyinkronkan...' : 'Sinkron Cloud',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                      ),
                      Text(
                        pending > 0 ? '$pending data offline' : 'Data ter-backup',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDeveloperCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceCream,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cashKeyBorder),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.school_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppConstants.appName,
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Text(
                      '${AppConstants.developerName} - ${AppConstants.developerRole}',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      AppConstants.university,
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 11.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 24),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Versi Aplikasi',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
              Text(
                'v1.0.0 (Production Stable)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
