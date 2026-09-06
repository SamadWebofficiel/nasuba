import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String id;
  final String phone;
  final String firstName;
  final String lastName;
  final String? email;
  final String? profilePicture;
  final double rating;
  final int totalRides;
  final DateTime createdAt;
  final String status;

  UserModel({
    required this.id,
    required this.phone,
    required this.firstName,
    required this.lastName,
    this.email,
    this.profilePicture,
    this.rating = 5.0,
    this.totalRides = 0,
    required this.createdAt,
    this.status = 'active',
  });

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return UserModel(
      id: doc.id,
      phone: data['phone'] ?? '',
      firstName: data['firstName'] ?? '',
      lastName: data['lastName'] ?? '',
      email: data['email'],
      profilePicture: data['profilePicture'],
      rating: (data['rating'] ?? 5.0).toDouble(),
      totalRides: data['totalRides'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      status: data['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'phone': phone,
      'firstName': firstName,
      'lastName': lastName,
      if (email != null) 'email': email,
      if (profilePicture != null) 'profilePicture': profilePicture,
      'rating': rating,
      'totalRides': totalRides,
      'createdAt': Timestamp.fromDate(createdAt),
      'status': status,
    };
  }
}
