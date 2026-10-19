class AppConstants {
  static const String appName = 'InhilPOS Mobile';
  static const String appTagline = 'Smart Stock & Point of Sale UMKM';
  static const String developerName = 'Muhammad Daffa';
  static const String university = 'Universitas Islam Indragiri (UNISI)';
  static const String developerRole = 'S1 Sistem Informasi';

  // Default Store Settings
  static const String defaultStoreName = 'Toko Berkah Mandiri';
  static const String defaultStoreAddress = 'Jl. M. Boya No. 45, Tembilahan, Kab. Indragiri Hilir, Riau';
  static const String defaultStorePhone = '0812-7654-3210';
  static const String defaultReceiptFooter = 'Terima Kasih Telah Berbelanja!\nBarang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.';
  static const String defaultCashierName = 'Kasir 01';

  // Units
  static const List<String> commonUnits = [
    'Pcs',
    'Kg',
    'Bungkus',
    'Butir',
    'Renteng',
    'Dus',
    'Pack',
    'Liter',
    'Sak',
    'Ikat',
  ];

  // Common Categories
  static const List<String> defaultCategories = [
    'Semua',
    'Sembako & Beras',
    'Bumbu & Dapur',
    'Makanan Ringan',
    'Minuman',
    'Rokok & Tembakau',
    'Perlengkapan Rumah',
    'Kebutuhan Mandi',
  ];

  // Quick Cash Denominations (Tactile Keypad for POS)
  static const List<int> quickCashOptions = [
    10000,
    20000,
    50000,
    100000,
  ];
}
