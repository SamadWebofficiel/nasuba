import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../config/api_config.dart';
import 'active_ride_screen.dart';

class BookingScreen extends StatefulWidget {
  final String transportType; // 'Urbain' ou 'Interurbain'

  const BookingScreen({super.key, required this.transportType});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final TextEditingController _departureController = TextEditingController(text: 'Ma position actuelle');
  final TextEditingController _destinationController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();

  String _selectedVehicle = 'Voiture';
  bool _isRequesting = false;

  final List<Map<String, dynamic>> _vehicles = [
    {'type': 'Moto', 'icon': Icons.two_wheeler, 'time': '3 min'},
    {'type': 'Voiture', 'icon': Icons.directions_car, 'time': '5 min'},
    {'type': 'Van (7 pl.)', 'icon': Icons.airport_shuttle, 'time': '10 min'},
  ];

  @override
  void dispose() {
    _departureController.dispose();
    _destinationController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _requestRide() async {
    if (_destinationController.text.isEmpty || _priceController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez renseigner la destination et le prix.')),
      );
      return;
    }
    
    setState(() => _isRequesting = true);
    
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw 'Veuillez vous connecter pour commander une course.';
      
      final token = await user.getIdToken();
      final apiUrl = ApiConfig.baseUrl;
      
      final response = await http.post(
        Uri.parse('$apiUrl/api/rides/request'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'origin': {'name': _departureController.text, 'lat': 9.337, 'lng': 2.630}, // Dummy lat/lng for now
          'destination': {'name': _destinationController.text, 'lat': 9.350, 'lng': 2.640},
          'serviceType': widget.transportType,
          'pricing': {
            'estimatedAmount': int.tryParse(_priceController.text) ?? 0,
            'paymentMethod': 'CASH',
          }
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 201) {
        // Rediriger vers l'écran d'attente
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => ActiveRideScreen(rideId: data['rideId']),
            ),
          );
        }
      } else {
        throw data['message'] ?? 'Erreur inconnue du serveur.';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
      }
    } finally {
      if (mounted) setState(() => _isRequesting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey[50], // Placeholder pour la map
      body: Stack(
        children: [
          // 1. Placeholder pour la carte
          Positioned.fill(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.map, size: 80, color: Colors.blueGrey[300]),
                const SizedBox(height: 16),
                Text(
                  'Sélection de Trajet (${widget.transportType})',
                  style: TextStyle(color: Colors.blueGrey[400]),
                ),
              ],
            ),
          ),

          // 2. Bouton Retour
          Positioned(
            top: 50,
            left: 16,
            child: CircleAvatar(
              backgroundColor: Colors.white,
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.black87),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),

          // 3. Panneau de réservation en bas
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
                  // Formulaire de Trajet
                  _buildLocationInput(
                    icon: Icons.my_location,
                    iconColor: Colors.blue,
                    controller: _departureController,
                    hint: 'Point de départ',
                  ),
                  const SizedBox(height: 8),
                  _buildLocationInput(
                    icon: Icons.location_on,
                    iconColor: Colors.red,
                    controller: _destinationController,
                    hint: 'Où allez-vous ?',
                    autoFocus: true,
                  ),
                  const SizedBox(height: 24),
                  
                  // Sélection du véhicule
                  const Text('Type de véhicule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: _vehicles.map((v) => _buildVehicleOption(v['type'], v['icon'], v['time'])).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Proposition de prix (Espèces V1)
                  const Text('Proposez votre prix (FCFA)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _priceController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.payments, color: Colors.green),
                      hintText: 'Ex: 1500',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Bouton Commander
                  ElevatedButton(
                    onPressed: _isRequesting ? null : _requestRide,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: Theme.of(context).primaryColor,
                    ),
                    child: _isRequesting 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Commander', style: TextStyle(fontSize: 18, color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationInput({
    required IconData icon,
    required Color iconColor,
    required TextEditingController controller,
    required String hint,
    bool autoFocus = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: controller,
              autofocus: autoFocus,
              decoration: InputDecoration(
                hintText: hint,
                border: InputBorder.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleOption(String type, IconData icon, String time) {
    final isSelected = _selectedVehicle == type;
    return GestureDetector(
      onTap: () => setState(() => _selectedVehicle = type),
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.1) : Colors.white,
          border: Border.all(
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey[300]!,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: isSelected ? Theme.of(context).primaryColor : Colors.grey[600]),
            const SizedBox(height: 8),
            Text(type, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isSelected ? Theme.of(context).primaryColor : Colors.black87)),
            const SizedBox(height: 4),
            Text(time, style: TextStyle(fontSize: 10, color: Colors.grey[600])),
          ],
        ),
      ),
    );
  }
}
