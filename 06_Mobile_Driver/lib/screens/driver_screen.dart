import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nasuba_driver_app/providers/driver_status_provider.dart';
import 'package:nasuba_driver_app/providers/location_provider.dart';
import 'package:nasuba_driver_app/screens/vehicle_management_screen.dart';
import 'package:nasuba_driver_app/screens/quotes_management_screen.dart';
import 'package:nasuba_driver_app/providers/auth_provider.dart';
import 'package:nasuba_driver_app/widgets/radar_effect.dart';
import 'package:nasuba_driver_app/widgets/ride_request_popup.dart';

class DriverScreen extends ConsumerStatefulWidget {
  const DriverScreen({super.key});

  @override
  ConsumerState<DriverScreen> createState() => _DriverScreenState();
}

class _DriverScreenState extends ConsumerState<DriverScreen> {
  GoogleMapController? mapController;
  final LatLng _center = const LatLng(9.3496, 2.6180); // Par défaut Parakou
  
  // Infrastructures state
  bool _showFilters = false;
  String? _activeFilter;
  Set<Marker> _infrastructureMarkers = {};

  final List<Map<String, dynamic>> _driverFilters = [
    {'name': 'Essence', 'icon': '⛽', 'query': 'Automobile'},
    {'name': 'Santé', 'icon': '🏥', 'query': 'Santé'},
    {'name': 'Gares', 'icon': '🚌', 'query': 'Transport'},
  ];

  @override
  void initState() {
    super.initState();
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Enregistrer le callback pour les nouvelles requêtes de course
    ref.read(driverStatusProvider.notifier).onNewRideRequest = (rideData) {
      if (mounted) {
        _showRideRequestDialog(rideData);
      }
    };
  }

  void _onMyLocationPressed() {
    final locState = ref.read(locationProvider);
    locState.whenData((pos) {
      if (pos != null && mapController != null) {
        mapController!.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(target: LatLng(pos.latitude, pos.longitude), zoom: 16.0),
          ),
        );
      }
    });
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  void _showRideRequestDialog(Map<String, dynamic> rideData) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => RideRequestPopup(rideData: rideData),
    );
  }

  Future<void> _fetchInfrastructures(String category) async {
    setState(() => _activeFilter = category);
    
    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('infrastructures')
          .where('category', isEqualTo: category)
          .get();

      final Set<Marker> newMarkers = {};
      
      for (var doc in snapshot.docs) {
        final data = doc.data();
        if (data['position'] != null) {
          final lat = data['position']['lat'];
          final lng = data['position']['lng'];
          
          newMarkers.add(
            Marker(
              markerId: MarkerId(doc.id),
              position: LatLng(lat, lng),
              infoWindow: InfoWindow(
                title: data['name'] ?? 'Lieu',
                snippet: data['address'] ?? '',
                onTap: () => _showPlaceDetails(data),
              ),
              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueCyan),
            ),
          );
        }
      }

      setState(() {
        _infrastructureMarkers = newMarkers;
      });
      
    } catch (e) {
      print("Erreur chargement infrastructures: $e");
    }
  }

  void _showPlaceDetails(Map<String, dynamic> data) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(data['icon'] ?? '📍', style: const TextStyle(fontSize: 24)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(data['name'] ?? 'Inconnu', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (data['address'] != null) ...[
                Row(children: [const Icon(Icons.location_on, size: 16, color: Colors.grey), const SizedBox(width: 8), Text(data['address'])]),
                const SizedBox(height: 8),
              ],
              if (data['phone'] != null) ...[
                Row(children: [const Icon(Icons.phone, size: 16, color: Colors.grey), const SizedBox(width: 8), Text(data['phone'])]),
                const SizedBox(height: 16),
              ],
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    // Option: Lancer la navigation vers ce lieu via Maps externe
                  },
                  icon: const Icon(Icons.navigation),
                  label: const Text('Naviguer vers ce lieu'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              )
            ],
          ),
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AsyncValue<bool>>(driverStatusProvider, (previous, next) {
      next.whenOrNull(
        error: (err, stack) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err.toString()), backgroundColor: Colors.red),
          );
        },
      );
    });

    final statusState = ref.watch(driverStatusProvider);
    final isOnline = statusState.valueOrNull ?? false;
    final locationState = ref.watch(locationProvider);
    final currentRide = ref.watch(currentRideProvider);
    
    Set<Marker> markers = {};
    // Ajout des marqueurs infrastructures
    markers.addAll(_infrastructureMarkers);
    
    locationState.whenData((pos) {
      if (pos != null) {
        markers.add(
          Marker(
            markerId: const MarkerId('driver_car'),
            position: LatLng(pos.latitude, pos.longitude),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
            infoWindow: const InfoWindow(title: 'Votre Position'),
          ),
        );
      }
    });

    if (currentRide != null && currentRide['route'] != null) {
      final pickupLat = currentRide['route']['origin']['lat'];
      final pickupLng = currentRide['route']['origin']['lng'];
      markers.add(
        Marker(
          markerId: const MarkerId('passenger_pickup'),
          position: LatLng(pickupLat, pickupLng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: const InfoWindow(title: 'Client à récupérer'),
        ),
      );
    }

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('NASUBA Chauffeur', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: Theme.of(context).primaryColor),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CircleAvatar(radius: 30, backgroundColor: Colors.white, child: Icon(Icons.person, size: 35)),
                  SizedBox(height: 12),
                  Text('Espace Prestataire', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.directions_car),
              title: const Text('Mes véhicules & services'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const VehicleManagementScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.request_quote),
              title: const Text('Mes devis en attente'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const QuotesManagementScreen()));
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Déconnexion', style: TextStyle(color: Colors.red)),
              onTap: () async {
                Navigator.pop(context);
                await ref.read(authProvider.notifier).signOut();
              },
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            myLocationEnabled: false, 
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            initialCameraPosition: CameraPosition(
              target: _center,
              zoom: 13.0,
            ),
            markers: markers,
          ),
          
          if (isOnline && currentRide == null)
            const IgnorePointer(
              child: RadarEffect(color: Color(0xFF0F62FE)),
            ),
          
          Positioned(
            top: 100,
            left: 24,
            right: 24,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
              decoration: BoxDecoration(
                color: isOnline ? const Color(0xFF24A148) : Colors.white,
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isOnline ? Icons.wifi : Icons.wifi_off,
                    color: isOnline ? Colors.white : Colors.grey,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isOnline ? 'VOUS ÊTES EN LIGNE' : 'HORS LIGNE',
                    style: TextStyle(
                      color: isOnline ? Colors.white : Colors.grey,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Menu Filtres Infrastructures (Gauche)
          Positioned(
            left: 16,
            top: 180,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: _showFilters ? Colors.white : Theme.of(context).primaryColor,
              child: Icon(
                _showFilters ? Icons.close : Icons.layers,
                color: _showFilters ? Colors.black87 : Colors.white,
              ),
              onPressed: () {
                setState(() {
                  _showFilters = !_showFilters;
                  if (!_showFilters) {
                    _activeFilter = null;
                    _infrastructureMarkers.clear();
                  }
                });
              },
            ),
          ),

          if (_showFilters)
            Positioned(
              left: 16,
              top: 230,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: _driverFilters.map((cat) {
                    final isActive = _activeFilter == cat['query'];
                    return InkWell(
                      onTap: () {
                        if (isActive) {
                          setState(() { _activeFilter = null; _infrastructureMarkers.clear(); });
                        } else {
                          _fetchInfrastructures(cat['query']);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        margin: const EdgeInsets.only(bottom: 4),
                        decoration: BoxDecoration(
                          color: isActive ? Theme.of(context).primaryColor.withOpacity(0.1) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Text(cat['icon'], style: const TextStyle(fontSize: 18)),
                            const SizedBox(width: 8),
                            Text(cat['name'], style: TextStyle(
                              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                              color: isActive ? Theme.of(context).primaryColor : Colors.black87
                            )),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

          Positioned(
            bottom: currentRide != null ? 240 : 120, // Remonter si course
            right: 24,
            child: FloatingActionButton(
              onPressed: _onMyLocationPressed,
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).primaryColor,
              child: const Icon(Icons.my_location),
            ),
          ),

          if (currentRide != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0, -5))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      currentRide['status'] == 'ACCEPTED' ? 'Nouveau client accepté' :
                      currentRide['status'] == 'DRIVER_ARRIVING' ? 'En route vers le client' :
                      currentRide['status'] == 'DRIVER_ARRIVED' ? 'En attente du client' :
                      currentRide['status'] == 'TRIP_STARTED' ? 'Course en cours' : 'Course terminée',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)
                    ),
                    const SizedBox(height: 16),
                    Text('Client : ${currentRide['traveler']?['phone'] ?? "Inconnu"}', style: const TextStyle(fontSize: 16)),
                    Text('Gain estimé : ${currentRide['pricing']?['estimatedAmount'] ?? "..."} XOF', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    if (currentRide['status'] == 'ACCEPTED')
                      ElevatedButton(
                        onPressed: () => ref.read(driverStatusProvider.notifier).updateRideStatus('DRIVER_ARRIVING'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F62FE), padding: const EdgeInsets.symmetric(vertical: 16)),
                        child: const Text('En route vers le client', style: TextStyle(color: Colors.white)),
                      )
                    else if (currentRide['status'] == 'DRIVER_ARRIVING')
                      ElevatedButton(
                        onPressed: () => ref.read(driverStatusProvider.notifier).updateRideStatus('DRIVER_ARRIVED'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, padding: const EdgeInsets.symmetric(vertical: 16)),
                        child: const Text('Je suis arrivé au point de départ', style: TextStyle(color: Colors.white)),
                      )
                    else if (currentRide['status'] == 'DRIVER_ARRIVED')
                      ElevatedButton(
                        onPressed: () => ref.read(driverStatusProvider.notifier).updateRideStatus('TRIP_STARTED'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF24A148), padding: const EdgeInsets.symmetric(vertical: 16)),
                        child: const Text('Démarrer la course', style: TextStyle(color: Colors.white)),
                      )
                    else if (currentRide['status'] == 'TRIP_STARTED')
                      ElevatedButton(
                        onPressed: () => ref.read(driverStatusProvider.notifier).updateRideStatus('TRIP_COMPLETED'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red, padding: const EdgeInsets.symmetric(vertical: 16)),
                        child: const Text('Terminer la course', style: TextStyle(color: Colors.white)),
                      ),
                    const SizedBox(height: 8),
                    if (currentRide['status'] != 'TRIP_STARTED')
                      TextButton(
                        onPressed: () => ref.read(driverStatusProvider.notifier).cancelRide(),
                        child: const Text('Annuler la course', style: TextStyle(color: Colors.red)),
                      )
                  ],
                ),
              ),
            )
          else
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(24),
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
                    const Text(
                      'Prêt à recevoir des courses ?',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isOnline ? 'En attente de clients dans votre zone...' : 'Passez en ligne pour commencer.',
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        if (statusState.isLoading) return;
                        ref.read(driverStatusProvider.notifier).toggleOnlineStatus();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isOnline ? Colors.red : const Color(0xFF0F62FE),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: statusState.isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              isOnline ? 'PASSER HORS LIGNE' : 'PASSER EN LIGNE',
                              style: const TextStyle(fontSize: 18, color: Colors.white),
                            ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
