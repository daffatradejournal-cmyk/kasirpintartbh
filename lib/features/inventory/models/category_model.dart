import 'package:equatable/equatable.dart';

class CategoryModel extends Equatable {
  final int? id;
  final String name;

  const CategoryModel({this.id, required this.name});

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'name': name,
    };
  }

  factory CategoryModel.fromMap(Map<String, dynamic> map) {
    return CategoryModel(
      id: map['id'] as int?,
      name: map['name'] as String,
    );
  }

  @override
  List<Object?> get props => [id, name];
}
