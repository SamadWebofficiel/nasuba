import 'package:cloud_firestore/cloud_firestore.dart';

class DriverModel {
  final String id;
  final String phone;
  final String firstName;
  final String lastName;
  final String? email;
  final String? profilePicture;
  final double rating;
  final int totalRides;
  final DateTime createdAt;
  final String status; // 'PENDING_KYC', 'ACTIVE', 'SUSPENDED'
  final bool isOnline;
  final Map<String, dynamic>? location;
  final List<String> allowedServices;

  DriverModel({
    required this.id,
    required this.phone,
    required this.firstName,
    required this.lastName,
    this.email,
    this.profilePicture,
    this.rating = 5.0,
    this.totalRides = 0,
    required this.createdAt,
    this.status = 'PENDING_KYC',
    this.isOnline = false,
    this.location,
    this.allowedServices = const [],
  });

  factory DriverModel.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return DriverModel(
      id: doc.id,
      phone: data['phone'] ?? '',
      firstName: data['firstName'] ?? '',
      lastName: data['lastName'] ?? '',
      email: data['email'],
      profilePicture: data['profilePicture'],
      rating: (data['rating'] ?? 5.0).toDouble(),
      totalRides: data['totalRides'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      status: data['status'] ?? 'PENDING_KYC',
      isOnline: data['isOnline'] ?? false,
      location: data['location'],
      allowedServices: List<String>.from(data['allowedServices'] ?? []),
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
      'isOnline': isOnline,
      if (location != null) 'location': location,
      'allowedServices': allowedServices,
    };
  }
}
