import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_constants.dart';
import '../models/store_profile_model.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  static const String _keyStoreName = 'store_name';
  static const String _keyAddress = 'store_address';
  static const String _keyPhone = 'store_phone';
  static const String _keyFooter = 'receipt_footer';
  static const String _keyCashier = 'active_cashier';

  Future<void> loadProfile() async {
    emit(AuthLoading());
    try {
      final prefs = await SharedPreferences.getInstance();
      final profile = StoreProfileModel(
        storeName: prefs.getString(_keyStoreName) ?? AppConstants.defaultStoreName,
        address: prefs.getString(_keyAddress) ?? AppConstants.defaultStoreAddress,
        phone: prefs.getString(_keyPhone) ?? AppConstants.defaultStorePhone,
        receiptFooter: prefs.getString(_keyFooter) ?? AppConstants.defaultReceiptFooter,
        activeCashier: prefs.getString(_keyCashier) ?? AppConstants.defaultCashierName,
      );
      emit(AuthLoaded(profile: profile));
    } catch (e) {
      emit(AuthError('Gagal memuat profil toko: $e'));
    }
  }

  Future<void> updateProfile(StoreProfileModel newProfile) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyStoreName, newProfile.storeName);
      await prefs.setString(_keyAddress, newProfile.address);
      await prefs.setString(_keyPhone, newProfile.phone);
      await prefs.setString(_keyFooter, newProfile.receiptFooter);
      await prefs.setString(_keyCashier, newProfile.activeCashier);

      emit(AuthLoaded(profile: newProfile));
    } catch (e) {
      emit(AuthError('Gagal menyimpan profil toko: $e'));
    }
  }

  Future<void> switchCashier(String cashierName) async {
    if (state is AuthLoaded) {
      final current = (state as AuthLoaded).profile;
      final updated = current.copyWith(activeCashier: cashierName);
      await updateProfile(updated);
    }
  }
}
