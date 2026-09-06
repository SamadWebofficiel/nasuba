import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'location_provider.dart';

final currentRideProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

final driverStatusProvider = StateNotifierProvider<DriverStatusNotifier, AsyncValue<bool>>((ref) {
  return DriverStatusNotifier(ref);
});

class DriverStatusNotifier extends StateNotifier<AsyncValue<bool>> {
  final Ref ref;
  DriverStatusNotifier(this.ref) : super(const AsyncValue.data(false));
  
  ProviderSubscription? _locationSubscription;
  StreamSubscription<QuerySnapshot>? ridesSubscription;
  Function(Map<String, dynamic>)? onNewRideRequest;
  String? currentRideId;

  Future<void> toggleOnlineStatus() async {
    final bool willBeOnline = !(state.value ?? false);
    state = const AsyncValue.loading();
    
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw 'Utilisateur non connecté';
      final driverId = user.uid;
      final firestore = FirebaseFirestore.instance;

      if (willBeOnline) {
        // Passer en ligne
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          throw 'Les services de localisation sont désactivés.';
        }
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.denied) {
            throw 'Les permissions de localisation sont refusées.';
          }
        }
        if (permission == LocationPermission.deniedForever) {
          throw 'Les permissions de localisation sont refusées définitivement.';
        }

        final position = await Geolocator.getCurrentPosition();
        await firestore.collection('active_drivers').doc(driverId).set({
          'id': driverId,
          'lat': position.latitude,
          'lng': position.longitude,
          'updatedAt': FieldValue.serverTimestamp(),
          'status': 'ONLINE'
        });

        // Écouter les changements de position via locationProvider
        _locationSubscription = ref.listen<AsyncValue<Position?>>(locationProvider, (previous, next) {
          next.whenData((pos) async {
            if (pos != null && (state.value ?? false)) {
              await firestore.collection('active_drivers').doc(driverId).update({
                'lat': pos.latitude,
                'lng': pos.longitude,
                'updatedAt': FieldValue.serverTimestamp(),
              });
            }
          });
        });

        // Écouter les nouvelles courses
        _listenToRides(driverId);
      } else {
        // Passer hors ligne
        _locationSubscription?.close();
        ridesSubscription?.cancel();
        await firestore.collection('active_drivers').doc(driverId).delete();
      }
      state = AsyncValue.data(willBeOnline);
    } catch (e) {
      state = AsyncValue.error(e.toString(), StackTrace.current);
    }
  }

  void _listenToRides(String driverId) {
    // Le chauffeur écoute les courses en "PENDING"
    ridesSubscription = FirebaseFirestore.instance
        .collection('rides')
        .where('status', isEqualTo: 'PENDING')
        .snapshots()
        .listen((snapshot) {
      for (var change in snapshot.docChanges) {
        if (change.type == DocumentChangeType.added) {
          var data = change.doc.data() as Map<String, dynamic>;
          data['rideId'] = change.doc.id;
          if (onNewRideRequest != null) {
            onNewRideRequest!(data);
          }
        }
      }
    });
  }

  Future<void> acceptRide(String rideId, Map<String, dynamic> rideData) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      state = AsyncValue.error('Utilisateur non connecté', StackTrace.current);
      return;
    }
    
    try {
      final token = await user.getIdToken();
      final apiUrl = dotenv.env['API_URL'] ?? 'http://10.0.2.2:3000';

      final response = await http.post(
        Uri.parse('$apiUrl/api/rides/accept'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'rideId': rideId,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        currentRideId = rideId;
        rideData['status'] = 'ACCEPTED';
        ref.read(currentRideProvider.notifier).state = rideData;
        state = const AsyncValue.data(true); 
      } else {
        throw data['message'] ?? 'Erreur lors de l\'acceptation';
      }
    } catch (e) {
      state = AsyncValue.error(e.toString(), StackTrace.current);
    }
  }

  Future<void> updateRideStatus(String newStatus) async {
    if (currentRideId == null) return;
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw 'Utilisateur non connecté';

      final token = await user.getIdToken();
      final apiUrl = dotenv.env['API_URL'] ?? 'http://10.0.2.2:3000';
      
      final stateToUpdate = newStatus == 'TRIP_COMPLETED' ? 'COMPLETED' : newStatus;

      final response = await http.post(
        Uri.parse('$apiUrl/api/rides/update_state'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'rideId': currentRideId,
          'newState': stateToUpdate
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Mettre à jour l'état local
        final currentState = ref.read(currentRideProvider.notifier).state;
        if (currentState != null) {
          currentState['status'] = stateToUpdate;
          ref.read(currentRideProvider.notifier).state = Map.from(currentState);
        }
        
        if (stateToUpdate == 'COMPLETED' || stateToUpdate == 'CANCELLED_BY_DRIVER' || stateToUpdate == 'CANCELLED_BY_TRAVELER') {
          currentRideId = null;
          ref.read(currentRideProvider.notifier).state = null;
        }
      } else {
        throw data['message'] ?? 'Erreur lors de la mise à jour';
      }
    } catch (e) {
      state = AsyncValue.error(e.toString(), StackTrace.current);
    }
  }

  Future<void> cancelRide() async {
    await updateRideStatus('CANCELLED_BY_DRIVER');
  }

  @override
  void dispose() {
    _locationSubscription?.close();
    ridesSubscription?.cancel();
    super.dispose();
  }
}
