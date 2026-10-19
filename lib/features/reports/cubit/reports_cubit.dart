import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/database/database_helper.dart';
import '../../receipt/models/transaction_model.dart';
import 'reports_state.dart';

class ReportsCubit extends Cubit<ReportsState> {
  ReportsCubit() : super(ReportsState(selectedDate: DateTime.now()));

  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<void> setDateFilter(String filterType) async {
    emit(state.copyWith(dateFilterType: filterType));
    await loadReports();
  }

  Future<void> setSelectedDate(DateTime date) async {
    emit(state.copyWith(selectedDate: date));
    await loadReports();
  }

  Future<void> loadReports() async {
    emit(state.copyWith(isLoading: true, errorMessage: null));

    try {
      final db = await _dbHelper.database;
      final now = state.selectedDate;

      String dateCondition;
      List<dynamic> args = [];

      if (state.dateFilterType == 'TODAY') {
        final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
        final endOfDay = DateTime(now.year, now.month, now.day, 23, 59, 59).toIso8601String();
        dateCondition = 'created_at BETWEEN ? AND ?';
        args = [startOfDay, endOfDay];
      } else if (state.dateFilterType == 'WEEK') {
        final startOfWeek = now.subtract(const Duration(days: 7)).toIso8601String();
        final endOfWeek = now.toIso8601String();
        dateCondition = 'created_at BETWEEN ? AND ?';
        args = [startOfWeek, endOfWeek];
      } else {
        // MONTH
        final startOfMonth = DateTime(now.year, now.month, 1).toIso8601String();
        final endOfMonth = DateTime(now.year, now.month + 1, 0, 23, 59, 59).toIso8601String();
        dateCondition = 'created_at BETWEEN ? AND ?';
        args = [startOfMonth, endOfMonth];
      }

      // 1. Fetch valid (non-void) transactions
      final txRows = await db.query(
        'transactions',
        where: '$dateCondition AND is_void = 0',
        whereArgs: args,
        orderBy: 'created_at DESC',
      );

      double gross = 0.0;
      double cash = 0.0;
      double nonCash = 0.0;
      final List<TransactionModel> txList = [];

      for (final row in txRows) {
        final txId = row['id'] as String;
        final itemRows = await db.query(
          'transaction_items',
          where: 'transaction_id = ?',
          whereArgs: [txId],
        );
        final items = itemRows.map((it) => TransactionItemModel.fromMap(it)).toList();
        final model = TransactionModel.fromMap(row, items);
        txList.add(model);

        final finalAmount = model.finalAmount;
        gross += finalAmount;

        if (model.paymentMethod == 'CASH') {
          cash += finalAmount;
        } else {
          nonCash += finalAmount;
        }
      }

      // 2. Fetch all transactions (including void) for transaction history
      final allTxRows = await db.query(
        'transactions',
        where: dateCondition,
        whereArgs: args,
        orderBy: 'created_at DESC',
      );

      final List<TransactionModel> fullHistoryList = [];
      for (final row in allTxRows) {
        final txId = row['id'] as String;
        final itemRows = await db.query(
          'transaction_items',
          where: 'transaction_id = ?',
          whereArgs: [txId],
        );
        final items = itemRows.map((it) => TransactionItemModel.fromMap(it)).toList();
        fullHistoryList.add(TransactionModel.fromMap(row, items));
      }

      // 3. Calculate Net Profit = SUM((sell_price - buy_price) * quantity) - discount
      final profitQuery = await db.rawQuery('''
        SELECT 
          SUM((ti.sell_price - ti.buy_price) * ti.quantity - ti.discount) as total_profit
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.$dateCondition AND t.is_void = 0
      ''', args);

      double netProfit = (profitQuery.first['total_profit'] as num?)?.toDouble() ?? 0.0;

      // Subtract global cart discounts
      final cartDiscountQuery = await db.rawQuery('''
        SELECT SUM(discount_amount) as total_cart_discount
        FROM transactions
        WHERE $dateCondition AND is_void = 0
      ''', args);
      final totalCartDiscount = (cartDiscountQuery.first['total_cart_discount'] as num?)?.toDouble() ?? 0.0;
      netProfit -= totalCartDiscount;
      if (netProfit < 0) netProfit = 0.0;

      // 4. Fetch Top 5 Best Sellers
      final bestSellerRows = await db.rawQuery('''
        SELECT 
          ti.product_name,
          SUM(ti.quantity) as total_qty,
          SUM(ti.subtotal) as total_revenue
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.$dateCondition AND t.is_void = 0
        GROUP BY ti.product_name
        ORDER BY total_qty DESC
        LIMIT 5
      ''', args);

      final bestSellers = bestSellerRows.map((r) {
        return BestSellerItem(
          productName: r['product_name'] as String,
          totalQty: (r['total_qty'] as num).toInt(),
          totalRevenue: (r['total_revenue'] as num).toDouble(),
        );
      }).toList();

      emit(state.copyWith(
        isLoading: false,
        grossRevenue: gross,
        netProfit: netProfit,
        totalTransactions: txList.length,
        cashTotal: cash,
        nonCashTotal: nonCash,
        bestSellers: bestSellers,
        transactions: fullHistoryList,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: 'Gagal memuat rekap finansial: $e',
      ));
    }
  }

  Future<bool> voidTransaction(String transactionId) async {
    try {
      await _dbHelper.voidTransaction(transactionId);
      await loadReports();
      return true;
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Gagal membatalkan nota: $e'));
      return false;
    }
  }
}
