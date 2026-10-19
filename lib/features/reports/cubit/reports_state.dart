import 'package:equatable/equatable.dart';
import '../../receipt/models/transaction_model.dart';

class BestSellerItem extends Equatable {
  final String productName;
  final int totalQty;
  final double totalRevenue;

  const BestSellerItem({
    required this.productName,
    required this.totalQty,
    required this.totalRevenue,
  });

  @override
  List<Object?> get props => [productName, totalQty, totalRevenue];
}

class ReportsState extends Equatable {
  final bool isLoading;
  final DateTime selectedDate;
  final String dateFilterType; // 'TODAY', 'WEEK', 'MONTH'
  final double grossRevenue;
  final double netProfit;
  final int totalTransactions;
  final double cashTotal;
  final double nonCashTotal;
  final List<BestSellerItem> bestSellers;
  final List<TransactionModel> transactions;
  final String? errorMessage;

  const ReportsState({
    this.isLoading = false,
    required this.selectedDate,
    this.dateFilterType = 'TODAY',
    this.grossRevenue = 0.0,
    this.netProfit = 0.0,
    this.totalTransactions = 0,
    this.cashTotal = 0.0,
    this.nonCashTotal = 0.0,
    this.bestSellers = const [],
    this.transactions = const [],
    this.errorMessage,
  });

  ReportsState copyWith({
    bool? isLoading,
    DateTime? selectedDate,
    String? dateFilterType,
    double? grossRevenue,
    double? netProfit,
    int? totalTransactions,
    double? cashTotal,
    double? nonCashTotal,
    List<BestSellerItem>? bestSellers,
    List<TransactionModel>? transactions,
    String? errorMessage,
  }) {
    return ReportsState(
      isLoading: isLoading ?? this.isLoading,
      selectedDate: selectedDate ?? this.selectedDate,
      dateFilterType: dateFilterType ?? this.dateFilterType,
      grossRevenue: grossRevenue ?? this.grossRevenue,
      netProfit: netProfit ?? this.netProfit,
      totalTransactions: totalTransactions ?? this.totalTransactions,
      cashTotal: cashTotal ?? this.cashTotal,
      nonCashTotal: nonCashTotal ?? this.nonCashTotal,
      bestSellers: bestSellers ?? this.bestSellers,
      transactions: transactions ?? this.transactions,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        isLoading,
        selectedDate,
        dateFilterType,
        grossRevenue,
        netProfit,
        totalTransactions,
        cashTotal,
        nonCashTotal,
        bestSellers,
        transactions,
        errorMessage,
      ];
}
