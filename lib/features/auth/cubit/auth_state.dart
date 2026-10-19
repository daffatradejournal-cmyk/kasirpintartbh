import 'package:equatable/equatable.dart';
import '../models/store_profile_model.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthLoaded extends AuthState {
  final StoreProfileModel profile;

  const AuthLoaded({required this.profile});

  @override
  List<Object?> get props => [profile];
}

class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}
