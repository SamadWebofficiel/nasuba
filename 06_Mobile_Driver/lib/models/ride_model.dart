import 'package:cloud_firestore/cloud_firestore.dart';

class RideModel {
  final String id;
  final String travelerId;
  final String? driverId;
  final String status;
  final String serviceType;
  
  final Map<String, dynamic> pickupLocation;
  final Map<String, dynamic> dropoffLocation;
  
  final double proposedPrice;
  final double? acceptedPrice;
  final String paymentMethod;
  
  final DateTime requestedAt;
  final DateTime? acceptedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  
  final Map<String, dynamic>? details;

  RideModel({
    required this.id,
    required this.travelerId,
    this.driverId,
    required this.status,
    required this.serviceType,
    required this.pickupLocation,
    required this.dropoffLocation,
    required this.proposedPrice,
    this.acceptedPrice,
    required this.paymentMethod,
    required this.requestedAt,
    this.acceptedAt,
    this.startedAt,
    this.completedAt,
    this.details,
  });

  factory RideModel.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return RideModel(
      id: doc.id,
      travelerId: data['traveler']?['id'] ?? data['travelerId'] ?? '',
      driverId: data['driver']?['id'] ?? data['driverId'],
      status: data['status'] ?? 'REQUESTED',
      serviceType: data['serviceType'] ?? 'URBAN',
      pickupLocation: data['pickupLocation'] ?? {},
      dropoffLocation: data['dropoffLocation'] ?? {},
      proposedPrice: (data['proposedPrice'] ?? 0.0).toDouble(),
      acceptedPrice: data['acceptedPrice'] != null ? data['acceptedPrice'].toDouble() : null,
      paymentMethod: data['paymentMethod'] ?? 'CASH',
      requestedAt: (data['requestedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      acceptedAt: (data['acceptedAt'] as Timestamp?)?.toDate(),
      startedAt: (data['startedAt'] as Timestamp?)?.toDate(),
      completedAt: (data['completedAt'] as Timestamp?)?.toDate(),
      details: data['details'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'traveler': {'id': travelerId},
      if (driverId != null) 'driver': {'id': driverId},
      'status': status,
      'serviceType': serviceType,
      'pickupLocation': pickupLocation,
      'dropoffLocation': dropoffLocation,
      'proposedPrice': proposedPrice,
      if (acceptedPrice != null) 'acceptedPrice': acceptedPrice,
      'paymentMethod': paymentMethod,
      'requestedAt': Timestamp.fromDate(requestedAt),
      if (acceptedAt != null) 'acceptedAt': Timestamp.fromDate(acceptedAt!),
      if (startedAt != null) 'startedAt': Timestamp.fromDate(startedAt!),
      if (completedAt != null) 'completedAt': Timestamp.fromDate(completedAt!),
      if (details != null) 'details': details,
    };
  }
}
