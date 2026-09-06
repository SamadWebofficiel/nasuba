import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_voyage_mobile/providers/location_provider.dart';
import 'package:nasuba_voyage_mobile/providers/ride_provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class TaxiServiceScreen extends ConsumerStatefulWidget {
  const TaxiServiceScreen({super.key});

  @override
  ConsumerState<TaxiServiceScreen> createState() => _TaxiServiceScreenState();
}

class _TaxiServiceScreenState extends ConsumerState<TaxiServiceScreen> {
  GoogleMapController? mapController;
  final LatLng _center = const LatLng(9.3496, 2.6180); // Centre du Bénin
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _listenToActiveDrivers();
  }

  void _listenToActiveDrivers() {
    FirebaseFirestore.instance.collection('active_drivers').snapshots().listen((snapshot) {
      if (mounted) {
        setState(() {
          _markers.clear();
          for (var doc in snapshot.docs) {
            var driver = doc.data();
            _markers.add(
              Marker(
                markerId: MarkerId(doc.id),
                position: LatLng(driver['lat'], driver['lng']),
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
                infoWindow: const InfoWindow(title: 'Chauffeur NASUBA'),
              ),
            );
          }
        });
      }
    });
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  Widget _buildRideStatusPanel(Map<String, dynamic> rideData) {
    final status = rideData['status'];
    final driver = rideData['driver'];
    
    String title = 'Recherche en cours...';
    String subtitle = 'Veuillez patienter';
    Color statusColor = Colors.orange;

    if (status == 'ACCEPTED') {
      title = 'Course Acceptée !';
      subtitle = 'Le chauffeur se prépare.';
      statusColor = Colors.blue;
    } else if (status == 'DRIVER_ARRIVING') {
      title = 'Le chauffeur est en route';
      subtitle = 'Préparez-vous.';
      statusColor = Colors.blueAccent;
    } else if (status == 'DRIVER_ARRIVED') {
      title = 'Le chauffeur est là !';
      subtitle = 'Rejoignez le véhicule.';
      statusColor = Colors.green;
    } else if (status == 'TRIP_STARTED') {
      title = 'En route vers la destination';
      subtitle = 'Bon voyage !';
      statusColor = Colors.green;
    } else if (status == 'TRIP_COMPLETED') {
      title = 'Vous êtes arrivé !';
      subtitle = 'Merci d\'avoir voyagé avec NASUBA.';
      statusColor = Colors.indigo;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Icon(Icons.info_outline, color: statusColor),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: statusColor)),
          ],
        ),
        const SizedBox(height: 8),
        Text(subtitle, style: const TextStyle(fontSize: 16)),
        
        if (driver != null) ...[
          const Divider(height: 32),
          Row(
            children: [
              const CircleAvatar(
                radius: 24,
                backgroundColor: Color(0xFF0F62FE),
                child: Icon(Icons.person, color: Colors.white),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Chauffeur', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                    Text(driver['phone'] ?? 'Chauffeur', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 16),
                      Text(' ${driver['rating'] ?? 5.0}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Text(driver['vehicle'] ?? 'Véhicule standard', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              )
            ],
          ),
        ],
        const SizedBox(height: 16),
        if (status == 'TRIP_COMPLETED')
          ElevatedButton(
            onPressed: () => ref.read(rideProvider.notifier).completeRideLocally(),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F62FE)),
            child: const Text('Terminer', style: TextStyle(color: Colors.white)),
          )
        else if (status != 'TRIP_STARTED')
          ElevatedButton(
            onPressed: () => ref.read(rideProvider.notifier).cancelRide(),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Annuler la course', style: TextStyle(color: Colors.white)),
          )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final locationState = ref.watch(locationProvider);
    final rideState = ref.watch(rideProvider);
    
    // Si la position est acquise, animer la carte
    locationState.whenData((position) {
      if (position != null && mapController != null) {
        mapController!.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              target: LatLng(position.latitude, position.longitude),
              zoom: 15.0,
            ),
          ),
        );
      }
    });

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('NASUBA Taxi', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10),
              ],
            ),
            child: IconButton(
              icon: Icon(Icons.person, color: Theme.of(context).primaryColor),
              onPressed: () {
                // TODO: Profil
              },
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            initialCameraPosition: CameraPosition(
              target: _center,
              zoom: 6.0,
            ),
            markers: _markers,
          ),
          
          // Search Bar Floater
          Positioned(
            top: 100,
            left: 24,
            right: 24,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 4)),
                ],
              ),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Où allons-nous ?',
                  prefixIcon: Icon(Icons.search, color: Theme.of(context).primaryColor),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  filled: false,
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ),
          
          // Location Button
          Positioned(
            bottom: rideState.isLoading || (rideState.value != null && rideState.value!['status'] != 'CANCELLED_BY_TRAVELER') ? 220 : 180, 
            right: 24,
            child: FloatingActionButton(
              onPressed: () => ref.read(locationProvider.notifier).determinePosition(),
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).primaryColor,
              elevation: 4,
              child: locationState.isLoading 
                ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 2)) 
                : const Icon(Icons.my_location),
            ),
          ),
          
          // Bottom Panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24.0),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                boxShadow: [
                  BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0, -5)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (rideState.isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24.0),
                      child: Column(
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text('Recherche d\'un chauffeur NASUBA...', style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  else if (rideState.value != null && !['CANCELLED_BY_TRAVELER', 'CANCELLED_BY_DRIVER'].contains(rideState.value!['status']))
                    _buildRideStatusPanel(rideState.value!)
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Prêt à partir ?',
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Trouvez un chauffeur fiable en un clic.',
                          style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            final pos = locationState.value;
                            if (pos != null) {
                              ref.read(rideProvider.notifier).requestRide(pos);
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Veuillez activer la localisation d\'abord.')),
                              );
                            }
                          },
                          child: const Text('Commander un NASUBA', style: TextStyle(fontSize: 18)),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
