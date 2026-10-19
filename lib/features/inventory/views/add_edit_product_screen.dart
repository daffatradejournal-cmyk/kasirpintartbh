import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../cubit/inventory_cubit.dart';
import '../cubit/inventory_state.dart';
import '../models/product_model.dart';
import 'barcode_scanner_screen.dart';

class AddEditProductScreen extends StatefulWidget {
  final ProductModel? product;

  const AddEditProductScreen({super.key, this.product});

  @override
  State<AddEditProductScreen> createState() => _AddEditProductScreenState();
}

class _AddEditProductScreenState extends State<AddEditProductScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _codeController;
  late TextEditingController _nameController;
  late TextEditingController _buyPriceController;
  late TextEditingController _sellPriceController;
  late TextEditingController _stockController;
  late TextEditingController _minStockController;

  String _selectedCategory = 'Sembako & Beras';
  String _selectedUnit = 'Pcs';

  double _calculatedMargin = 0.0;
  double _calculatedPercentage = 0.0;

  bool get isEdit => widget.product != null;

  @override
  void initState() {
    super.initState();
    final p = widget.product;

    _codeController = TextEditingController(text: p?.code ?? '');
    _nameController = TextEditingController(text: p?.name ?? '');
    _buyPriceController = TextEditingController(
      text: p != null ? p.buyPrice.toInt().toString() : '',
    );
    _sellPriceController = TextEditingController(
      text: p != null ? p.sellPrice.toInt().toString() : '',
    );
    _stockController = TextEditingController(
      text: p != null ? (p.stock % 1 == 0 ? p.stock.toInt().toString() : p.stock.toString()) : '10',
    );
    _minStockController = TextEditingController(
      text: p != null ? (p.minStock % 1 == 0 ? p.minStock.toInt().toString() : p.minStock.toString()) : '5',
    );

    if (p != null) {
      _selectedCategory = p.categoryName;
      _selectedUnit = p.unit;
    }

    _calculateProfit();

    _buyPriceController.addListener(_calculateProfit);
    _sellPriceController.addListener(_calculateProfit);
  }

  void _calculateProfit() {
    final buy = CurrencyFormatter.parse(_buyPriceController.text);
    final sell = CurrencyFormatter.parse(_sellPriceController.text);
    setState(() {
      _calculatedMargin = sell - buy;
      _calculatedPercentage = buy > 0 ? ((sell - buy) / buy) * 100 : 0.0;
    });
  }

  @override
  void dispose() {
    _codeController.dispose();
    _nameController.dispose();
    _buyPriceController.dispose();
    _sellPriceController.dispose();
    _stockController.dispose();
    _minStockController.dispose();
    super.dispose();
  }

  Future<void> _scanBarcode() async {
    final scanned = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (_) => const BarcodeScannerScreen(title: 'Scan Barcode Produk'),
      ),
    );

    if (scanned != null && scanned.isNotEmpty) {
      setState(() {
        _codeController.text = scanned;
      });
    }
  }

  void _saveProduct() async {
    if (!_formKey.currentState!.validate()) return;

    final buy = CurrencyFormatter.parse(_buyPriceController.text);
    final sell = CurrencyFormatter.parse(_sellPriceController.text);
    final stock = double.tryParse(_stockController.text.replaceAll(',', '.')) ?? 0.0;
    final minStock = double.tryParse(_minStockController.text.replaceAll(',', '.')) ?? 5.0;

    final now = DateTime.now();

    final productToSave = ProductModel(
      id: widget.product?.id ?? const Uuid().v4(),
      code: _codeController.text.trim(),
      name: _nameController.text.trim(),
      categoryName: _selectedCategory,
      buyPrice: buy,
      sellPrice: sell,
      stock: stock,
      minStock: minStock,
      unit: _selectedUnit,
      createdAt: widget.product?.createdAt ?? now,
      updatedAt: now,
    );

    final cubit = context.read<InventoryCubit>();
    bool success;
    if (isEdit) {
      success = await cubit.updateProduct(productToSave);
    } else {
      success = await cubit.addProduct(productToSave);
    }

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.success,
          content: Text(isEdit ? 'Produk berhasil diubah!' : 'Produk baru berhasil disimpan!'),
        ),
      );
      Navigator.of(context).pop();
    } else {
      final err = cubit.state.errorMessage ?? 'Gagal menyimpan barang.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.error, content: Text(err)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Produk' : 'Tambah Produk Baru'),
        actions: [
          IconButton(
            tooltip: 'Simpan',
            icon: const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 28),
            onPressed: _saveProduct,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Barcode / SKU field with camera scan button
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _codeController,
                      decoration: const InputDecoration(
                        labelText: 'Kode Barcode / SKU',
                        hintText: 'Scan atau ketik barcode',
                        prefixIcon: Icon(Icons.qr_code_rounded),
                      ),
                      validator: (v) => v!.trim().isEmpty ? 'Barcode wajib diisi' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryContainer,
                        foregroundColor: AppColors.primaryDark,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                      icon: const Icon(Icons.qr_code_scanner_rounded),
                      label: const Text('Scan'),
                      onPressed: _scanBarcode,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Product Name
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Produk Barang',
                  hintText: 'Contoh: Minyak Goreng Kita 2L',
                  prefixIcon: Icon(Icons.shopping_bag_rounded),
                ),
                validator: (v) => v!.trim().isEmpty ? 'Nama barang wajib diisi' : null,
              ),
              const SizedBox(height: 14),

              // Category & Unit Selector
              Row(
                children: [
                  // Category Dropdown
                  Expanded(
                    flex: 3,
                    child: BlocBuilder<InventoryCubit, InventoryState>(
                      builder: (context, state) {
                        final validCats = state.categories.where((c) => c != 'Semua').toList();
                        if (!validCats.contains(_selectedCategory)) {
                          if (validCats.isNotEmpty) _selectedCategory = validCats.first;
                        }

                        return DropdownButtonFormField<String>(
                          value: _selectedCategory,
                          decoration: const InputDecoration(
                            labelText: 'Kategori',
                            prefixIcon: Icon(Icons.category_rounded),
                          ),
                          items: validCats.map((c) {
                            return DropdownMenuItem(value: c, child: Text(c, overflow: TextOverflow.ellipsis));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedCategory = val);
                          },
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Unit Dropdown
                  Expanded(
                    flex: 2,
                    child: DropdownButtonFormField<String>(
                      value: _selectedUnit,
                      decoration: const InputDecoration(
                        labelText: 'Satuan',
                      ),
                      items: AppConstants.commonUnits.map((u) {
                        return DropdownMenuItem(value: u, child: Text(u));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedUnit = val);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Buy Price & Sell Price
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _buyPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Harga Modal (Beli)',
                        prefixText: 'Rp ',
                        hintText: '0',
                      ),
                      validator: (v) {
                        if (v!.trim().isEmpty) return 'Wajib diisi';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _sellPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Harga Jual',
                        prefixText: 'Rp ',
                        hintText: '0',
                      ),
                      validator: (v) {
                        if (v!.trim().isEmpty) return 'Wajib diisi';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Realtime Profit Calculation Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: _calculatedMargin >= 0
                      ? AppColors.primaryContainer.withOpacity(0.4)
                      : AppColors.accentRose.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _calculatedMargin >= 0 ? AppColors.primaryLight : AppColors.accentRose,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _calculatedMargin >= 0 ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                          color: _calculatedMargin >= 0 ? AppColors.primary : AppColors.accentRose,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Estimasi Laba Bersih:',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: _calculatedMargin >= 0 ? AppColors.primaryDark : AppColors.accentRose,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      '${CurrencyFormatter.format(_calculatedMargin)} (${_calculatedPercentage.toStringAsFixed(1)}%)',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13.5,
                        color: _calculatedMargin >= 0 ? AppColors.primaryDark : AppColors.accentRose,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Stock & Min Stock Threshold
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _stockController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Jumlah Stok Saat Ini',
                        prefixIcon: Icon(Icons.inventory_2_rounded),
                      ),
                      validator: (v) => v!.trim().isEmpty ? 'Stok wajib diisi' : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _minStockController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Batas Minimum (Alert)',
                        prefixIcon: Icon(Icons.notifications_active_rounded),
                        helperText: 'Peringatan stok menipis',
                      ),
                      validator: (v) => v!.trim().isEmpty ? 'Wajib diisi' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Save Product Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.save_rounded),
                  label: Text(isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH KE KATALOG PRODUK'),
                  onPressed: _saveProduct,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
