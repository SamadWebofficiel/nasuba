import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_functions/cloud_functions.dart';

final rideProvider = StateNotifierProvider<RideNotifier, AsyncValue<Map<String, dynamic>?>>((ref) {
  return RideNotifier();
});

class RideNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>?>> {
  RideNotifier() : super(const AsyncValue.data(null));
  
  String? currentRideId;

  Future<void> requestRide(Position position) async {
    state = const AsyncValue.loading();
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw Exception("Utilisateur non connecté");

      final functions = FirebaseFunctions.instance;
      final callable = functions.httpsCallable('requestRide');
      
      final response = await callable.call({
        'serviceType': 'TAXI',
        'origin': {
          'lat': position.latitude,
          'lng': position.longitude,
          'address': 'Position actuelle'
        },
        'destination': {
          'lat': position.latitude + 0.01,
          'lng': position.longitude + 0.01,
          'address': 'Destination (démo)'
        },
        'pricing': {
          'estimatedAmount': 1500,
          'paymentMethod': 'CASH'
        }
      });
      
      final data = response.data;
      if (data['success'] == true) {
        currentRideId = data['rideId'];
        
        // Listen to the created ride document
        FirebaseFirestore.instance.collection('rides').doc(currentRideId).snapshots().listen((docSnap) {
          if (docSnap.exists) {
            state = AsyncValue.data(docSnap.data());
          }
        });
      } else {
        throw Exception(data['message'] ?? 'Erreur inconnue');
      }
      
    } catch (e) {
      state = AsyncValue.error(e.toString(), StackTrace.current);
    }
  }
  
  Future<void> cancelRide() async {
    if (currentRideId != null) {
      try {
        final callable = FirebaseFunctions.instance.httpsCallable('updateRideState');
        await callable.call({
          'rideId': currentRideId,
          'newState': 'CANCELLED_BY_TRAVELER'
        });
        currentRideId = null;
        state = const AsyncValue.data(null);
      } catch (e) {
        state = AsyncValue.error(e.toString(), StackTrace.current);
      }
    }
  }

  void completeRideLocally() {
    currentRideId = null;
    state = const AsyncValue.data(null);
  }
}
