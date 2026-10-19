import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('inhil_pos.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // 1. Categories Table
    await db.execute('''
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    ''');

    // 2. Products Table
    await db.execute('''
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category_name TEXT NOT NULL,
        buy_price REAL NOT NULL,
        sell_price REAL NOT NULL,
        stock REAL NOT NULL DEFAULT 0,
        min_stock REAL NOT NULL DEFAULT 5,
        unit TEXT NOT NULL DEFAULT 'Pcs',
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // 3. Transactions Table
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        total_amount REAL NOT NULL,
        discount_amount REAL NOT NULL DEFAULT 0,
        final_amount REAL NOT NULL,
        paid_amount REAL NOT NULL,
        change_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        cashier_name TEXT NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        note TEXT,
        is_void INTEGER NOT NULL DEFAULT 0,
        is_synced INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // 4. Transaction Items Table
    await db.execute('''
      CREATE TABLE transaction_items (
        id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_code TEXT,
        product_name TEXT NOT NULL,
        unit TEXT NOT NULL DEFAULT 'Pcs',
        buy_price REAL NOT NULL,
        sell_price REAL NOT NULL,
        discount REAL NOT NULL DEFAULT 0,
        quantity REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
      )
    ''');

    // 5. Sync Queue Table (Offline-First)
    await db.execute('''
      CREATE TABLE sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        retry_count INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // Seed default categories and realistic UMKM products
    await _seedInitialData(db);
  }

  Future<void> _seedInitialData(Database db) async {
    final categories = [
      'Sembako & Beras',
      'Bumbu & Dapur',
      'Makanan Ringan',
      'Minuman',
      'Rokok & Tembakau',
      'Perlengkapan Rumah',
      'Kebutuhan Mandi',
    ];

    for (var cat in categories) {
      await db.insert(
        'categories',
        {'name': cat},
        conflictAlgorithm: ConflictAlgorithm.ignore,
      );
    }

    const uuid = Uuid();
    final now = DateTime.now().toIso8601String();

    final initialProducts = [
      {
        'id': uuid.v4(),
        'code': '8999999000101',
        'name': 'Beras Ramos Super 5kg',
        'category_name': 'Sembako & Beras',
        'buy_price': 65000.0,
        'sell_price': 72000.0,
        'stock': 25.0,
        'min_stock': 5.0,
        'unit': 'Sak',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8999999000102',
        'name': 'Minyak Goreng Kita 2 Liter',
        'category_name': 'Sembako & Beras',
        'buy_price': 28500.0,
        'sell_price': 32000.0,
        'stock': 18.0,
        'min_stock': 6.0,
        'unit': 'Pouch',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8999999000103',
        'name': 'Gula Pasir Gulaku 1kg',
        'category_name': 'Sembako & Beras',
        'buy_price': 15000.0,
        'sell_price': 17500.0,
        'stock': 30.0,
        'min_stock': 10.0,
        'unit': 'Bungkus',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8999999000104',
        'name': 'Telur Ayam Ras 1 Papan (30 Butir)',
        'category_name': 'Sembako & Beras',
        'buy_price': 48000.0,
        'sell_price': 53000.0,
        'stock': 12.0,
        'min_stock': 4.0,
        'unit': 'Papan',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8998866200115',
        'name': 'Indomie Goreng Spesial',
        'category_name': 'Makanan Ringan',
        'buy_price': 2700.0,
        'sell_price': 3500.0,
        'stock': 96.0,
        'min_stock': 20.0,
        'unit': 'Bungkus',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8998866200116',
        'name': 'Kopi Kapal Api Spesial Mix 1 Renteng',
        'category_name': 'Minuman',
        'buy_price': 12500.0,
        'sell_price': 15000.0,
        'stock': 15.0,
        'min_stock': 5.0,
        'unit': 'Renteng',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8998866200117',
        'name': 'Susu Kental Manis Frisian Flag 370g',
        'category_name': 'Minuman',
        'buy_price': 10500.0,
        'sell_price': 12500.0,
        'stock': 4.0, // Low stock demo!
        'min_stock': 8.0,
        'unit': 'Kaleng',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8998866200118',
        'name': 'Kecap Bango Manis Refill 520ml',
        'category_name': 'Bumbu & Dapur',
        'buy_price': 19000.0,
        'sell_price': 22500.0,
        'stock': 14.0,
        'min_stock': 5.0,
        'unit': 'Pouch',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8998866200119',
        'name': 'Sabun Mandi Lifebuoy Total 10 85g',
        'category_name': 'Kebutuhan Mandi',
        'buy_price': 3800.0,
        'sell_price': 5000.0,
        'stock': 3.0, // Low stock demo!
        'min_stock': 10.0,
        'unit': 'Pcs',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
      {
        'id': uuid.v4(),
        'code': '8998866200120',
        'name': 'Sunlight Pencuci Piring Jeruk Nipis 750ml',
        'category_name': 'Perlengkapan Rumah',
        'buy_price': 14000.0,
        'sell_price': 17000.0,
        'stock': 9.0,
        'min_stock': 5.0,
        'unit': 'Pouch',
        'image_url': null,
        'created_at': now,
        'updated_at': now,
      },
    ];

    for (var product in initialProducts) {
      await db.insert('products', product);
    }
  }

  // --- ATOMIC TRANSACTION CHECKOUT ENGINE ---
  Future<void> checkoutTransaction({
    required Map<String, dynamic> transactionMap,
    required List<Map<String, dynamic>> items,
  }) async {
    final db = await database;
    await db.transaction((txn) async {
      // 1. Insert Transaction Record
      await txn.insert('transactions', transactionMap);

      // 2. Insert Each Item & Decrement Stock atomically
      for (final item in items) {
        await txn.insert('transaction_items', item);

        final String productId = item['product_id'] as String;
        final double qty = (item['quantity'] as num).toDouble();

        // Check current stock and decrement
        await txn.rawUpdate('''
          UPDATE products 
          SET stock = stock - ?, updated_at = ?
          WHERE id = ?
        ''', [qty, DateTime.now().toIso8601String(), productId]);
      }

      // 3. Register to Sync Queue for background cloud sync
      await txn.insert('sync_queue', {
        'entity_type': 'transaction',
        'entity_id': transactionMap['id'],
        'action': 'INSERT',
        'payload': transactionMap['invoice_number'],
        'created_at': DateTime.now().toIso8601String(),
        'status': 'PENDING',
        'retry_count': 0,
      });
    });
  }

  // --- VOID / CANCEL TRANSACTION WITH STOCK RESTORATION ---
  Future<void> voidTransaction(String transactionId) async {
    final db = await database;
    await db.transaction((txn) async {
      // 1. Get Transaction Items to restore stock
      final items = await txn.query(
        'transaction_items',
        where: 'transaction_id = ?',
        whereArgs: [transactionId],
      );

      for (final item in items) {
        final String productId = item['product_id'] as String;
        final double qty = (item['quantity'] as num).toDouble();

        // Restore stock
        await txn.rawUpdate('''
          UPDATE products 
          SET stock = stock + ?, updated_at = ?
          WHERE id = ?
        ''', [qty, DateTime.now().toIso8601String(), productId]);
      }

      // 2. Mark Transaction as Void
      await txn.update(
        'transactions',
        {'is_void': 1},
        where: 'id = ?',
        whereArgs: [transactionId],
      );

      // 3. Register Void to Sync Queue
      await txn.insert('sync_queue', {
        'entity_type': 'transaction_void',
        'entity_id': transactionId,
        'action': 'UPDATE',
        'payload': 'VOID_$transactionId',
        'created_at': DateTime.now().toIso8601String(),
        'status': 'PENDING',
        'retry_count': 0,
      });
    });
  }

  // Close DB
  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
    }
  }
}
