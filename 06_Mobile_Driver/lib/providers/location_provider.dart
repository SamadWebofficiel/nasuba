import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

final locationProvider = StateNotifierProvider<LocationNotifier, AsyncValue<Position?>>((ref) {
  return LocationNotifier();
});

class LocationNotifier extends StateNotifier<AsyncValue<Position?>> {
  StreamSubscription<Position>? _positionStreamSubscription;

  LocationNotifier() : super(const AsyncValue.loading()) {
    _initLocationTracking();
  }

  Future<void> _initLocationTracking() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        state = AsyncValue.error('Les services de localisation sont désactivés.', StackTrace.current);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          state = AsyncValue.error('Les permissions de localisation sont refusées.', StackTrace.current);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        state = AsyncValue.error('Les permissions de localisation sont refusées définitivement.', StackTrace.current);
        return;
      }

      // Obtenir la première position rapidement
      final initialPosition = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      if (mounted) {
        state = AsyncValue.data(initialPosition);
      }

      // Écouter les changements de position
      _positionStreamSubscription = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10, // Mise à jour tous les 10 mètres
        ),
      ).listen((Position position) {
        if (mounted) {
          state = AsyncValue.data(position);
        }
      });
    } catch (e) {
      if (mounted) {
        state = AsyncValue.error(e.toString(), StackTrace.current);
      }
    }
  }

  @override
  void dispose() {
    _positionStreamSubscription?.cancel();
    super.dispose();
  }
}
