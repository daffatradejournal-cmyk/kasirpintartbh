import 'package:equatable/equatable.dart';

class StoreProfileModel extends Equatable {
  final String storeName;
  final String address;
  final String phone;
  final String receiptFooter;
  final String activeCashier;

  const StoreProfileModel({
    required this.storeName,
    required this.address,
    required this.phone,
    required this.receiptFooter,
    required this.activeCashier,
  });

  StoreProfileModel copyWith({
    String? storeName,
    String? address,
    String? phone,
    String? receiptFooter,
    String? activeCashier,
  }) {
    return StoreProfileModel(
      storeName: storeName ?? this.storeName,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      receiptFooter: receiptFooter ?? this.receiptFooter,
      activeCashier: activeCashier ?? this.activeCashier,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'storeName': storeName,
      'address': address,
      'phone': phone,
      'receiptFooter': receiptFooter,
      'activeCashier': activeCashier,
    };
  }

  factory StoreProfileModel.fromMap(Map<String, dynamic> map) {
    return StoreProfileModel(
      storeName: map['storeName'] ?? '',
      address: map['address'] ?? '',
      phone: map['phone'] ?? '',
      receiptFooter: map['receiptFooter'] ?? '',
      activeCashier: map['activeCashier'] ?? '',
    );
  }

  @override
  List<Object?> get props => [
        storeName,
        address,
        phone,
        receiptFooter,
        activeCashier,
      ];
}
