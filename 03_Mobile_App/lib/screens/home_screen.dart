import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nasuba_voyage_mobile/screens/booking/booking_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String _selectedTransportType = 'Urbain';
  
  final Completer<GoogleMapController> _controller = Completer();
  LatLng? _currentPosition;
  bool _isLoadingMap = true;
  bool _locationPermissionDenied = false;

  // Map settings
  Set<Marker> _markers = {};
  
  // Infrastructures Filters
  bool _exploreMode = false;
  String? _activeFilter;

  final List<Map<String, dynamic>> _filterCategories = [
    {'name': 'Santé', 'icon': '🏥', 'query': 'Santé'},
    {'name': 'Sécurité', 'icon': '🚓', 'query': 'Sécurité'},
    {'name': 'Essence', 'icon': '⛽', 'query': 'Automobile'},
    {'name': 'Transport', 'icon': '🚌', 'query': 'Transport'},
    {'name': 'Hôtel', 'icon': '🏨', 'query': 'Hébergement'},
    {'name': 'Restaurant', 'icon': '🍽️', 'query': 'Restauration'},
    {'name': 'Banque', 'icon': '🏦', 'query': 'Services'},
    {'name': 'Marché', 'icon': '🛒', 'query': 'Commerce'},
  ];

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() => _isLoadingMap = false);
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _isLoadingMap = false;
          _locationPermissionDenied = true;
        });
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _isLoadingMap = false;
        _locationPermissionDenied = true;
      });
      return;
    } 

    try {
      Position position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = LatLng(position.latitude, position.longitude);
        _isLoadingMap = false;
      });
      
      final GoogleMapController controller = await _controller.future;
      controller.animateCamera(CameraUpdate.newCameraPosition(
        CameraPosition(target: _currentPosition!, zoom: 15.0),
      ));
    } catch (e) {
      setState(() => _isLoadingMap = false);
    }
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
              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
            ),
          );
        }
      }

      setState(() {
        _markers = newMarkers;
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
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BookingScreen(
                          transportType: _selectedTransportType,
                        ), // Idéalement, passer la destination ici
                      ),
                    );
                  },
                  icon: const Icon(Icons.directions_car),
                  label: const Text('Aller vers ce lieu'),
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
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: Stack(
        children: [
          // 1. Map
          Positioned.fill(
            child: _buildMap(),
          ),

          // 2. Profile & Menu buttons on Map
          Positioned(
            top: 50,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white,
                  child: IconButton(
                    icon: const Icon(Icons.menu, color: Colors.black87),
                    onPressed: () {},
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber[600], size: 16),
                      const SizedBox(width: 4),
                      const Text('5.0', style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 3. Explorer Mode (Filters)
          if (_exploreMode)
            Positioned(
              top: 110,
              left: 0,
              right: 0,
              child: SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _filterCategories.length,
                  itemBuilder: (context, index) {
                    final cat = _filterCategories[index];
                    final isActive = _activeFilter == cat['query'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ActionChip(
                        backgroundColor: isActive ? Theme.of(context).primaryColor : Colors.white,
                        labelStyle: TextStyle(color: isActive ? Colors.white : Colors.black87, fontWeight: FontWeight.bold),
                        avatar: Text(cat['icon']!),
                        label: Text(cat['name']!),
                        onPressed: () {
                          if (isActive) {
                            setState(() { _activeFilter = null; _markers.clear(); });
                          } else {
                            _fetchInfrastructures(cat['query']!);
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
            ),

          // 4. Explore Toggle Button (Middle Right)
          Positioned(
            right: 16,
            top: 180,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: _exploreMode ? Colors.white : Theme.of(context).primaryColor,
              child: Icon(
                _exploreMode ? Icons.close : Icons.explore,
                color: _exploreMode ? Colors.black87 : Colors.white,
              ),
              onPressed: () {
                setState(() {
                  _exploreMode = !_exploreMode;
                  if (!_exploreMode) {
                    _activeFilter = null;
                    _markers.clear();
                  }
                });
              },
            ),
          ),

          // 5. GPS My Location Button
          Positioned(
            right: 16,
            bottom: 300,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: Colors.white,
              child: const Icon(Icons.my_location, color: Colors.black87),
              onPressed: _determinePosition,
            ),
          ),

          // 6. Bottom Sheet for Ride Request
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                boxShadow: [
                  BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Transport Type Selector
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedTransportType = 'Urbain'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _selectedTransportType == 'Urbain' ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: _selectedTransportType == 'Urbain' ? [const BoxShadow(color: Colors.black12, blurRadius: 4)] : [],
                              ),
                              child: const Center(child: Text('Ville (Urbain)', style: TextStyle(fontWeight: FontWeight.bold))),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedTransportType = 'Interurbain'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _selectedTransportType == 'Interurbain' ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: _selectedTransportType == 'Interurbain' ? [const BoxShadow(color: Colors.black12, blurRadius: 4)] : [],
                              ),
                              child: const Center(child: Text('Voyage (Interurbain)', style: TextStyle(fontWeight: FontWeight.bold))),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Where to search bar
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BookingScreen(transportType: _selectedTransportType),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.search, color: Theme.of(context).primaryColor, size: 28),
                          const SizedBox(width: 16),
                          const Text(
                            'Où allez-vous ?',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Recent locations
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildQuickAction(Icons.home, 'Domicile'),
                      _buildQuickAction(Icons.work, 'Travail'),
                      _buildQuickAction(Icons.schedule, 'Plus tard'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMap() {
    if (_isLoadingMap) {
      return Container(
        color: Colors.blueGrey[50],
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Recherche de la position GPS...'),
            ],
          ),
        ),
      );
    }

    if (_locationPermissionDenied) {
      return Container(
        color: Colors.blueGrey[50],
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.location_off, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('Permission GPS refusée.', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _determinePosition,
                child: const Text('Réessayer'),
              )
            ],
          ),
        ),
      );
    }

    // Parakou by default if position is somehow null despite no error
    final CameraPosition initialPosition = CameraPosition(
      target: _currentPosition ?? const LatLng(9.337, 2.630), 
      zoom: 14.4746,
    );

    return GoogleMap(
      mapType: MapType.normal,
      initialCameraPosition: initialPosition,
      myLocationEnabled: true,
      myLocationButtonEnabled: false, // We use custom button
      zoomControlsEnabled: false,
      markers: _markers,
      onMapCreated: (GoogleMapController controller) {
        _controller.complete(controller);
      },
    );
  }

  Widget _buildQuickAction(IconData icon, String label) {
    return Column(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.grey[100],
          child: Icon(icon, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
