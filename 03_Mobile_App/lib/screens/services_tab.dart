import 'package:flutter/material.dart';
import 'package:nasuba_voyage_mobile/screens/services/taxi_service_screen.dart';
import 'package:nasuba_voyage_mobile/screens/services/urgent_service_screen.dart';
import 'package:nasuba_voyage_mobile/screens/services/event_service_screen.dart';
import 'package:nasuba_voyage_mobile/screens/services/medical_service_screen.dart';
import 'package:nasuba_voyage_mobile/screens/services/funeral_service_screen.dart';
import 'package:nasuba_voyage_mobile/screens/services/freight_service_screen.dart';

class ServicesTab extends StatelessWidget {
  const ServicesTab({super.key});

  final List<Map<String, dynamic>> _services = const [
    {
      'title': 'Véhicule urgent',
      'icon': Icons.emergency,
      'color': Colors.red,
      'route': UrgentServiceScreen(),
    },
    {
      'title': 'Événement',
      'icon': Icons.celebration,
      'color': Colors.purple,
      'route': EventServiceScreen(),
    },
    {
      'title': 'Transport médical',
      'icon': Icons.medical_services,
      'color': Colors.teal,
      'route': MedicalServiceScreen(),
    },
    {
      'title': 'Transport funéraire',
      'icon': Icons.church,
      'color': Colors.black87,
      'route': FuneralServiceScreen(),
    },
    {
      'title': 'Camion / Marchandises',
      'icon': Icons.local_shipping,
      'color': Colors.orange,
      'route': FreightServiceScreen(),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Services Spécialisés'),
        centerTitle: true,
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 0.9,
        ),
        itemCount: _services.length,
        itemBuilder: (context, index) {
          final service = _services[index];
          return _buildServiceCard(
            context: context,
            title: service['title'],
            icon: service['icon'],
            color: service['color'],
            targetScreen: service['route'],
          );
        },
      ),
    );
  }

  Widget _buildServiceCard({
    required BuildContext context,
    required String title,
    required IconData icon,
    required Color color,
    Widget? targetScreen,
  }) {
    return GestureDetector(
      onTap: () {
        if (targetScreen != null) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => targetScreen),
          );
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.1),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
          border: Border.all(color: color.withOpacity(0.1), width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: color),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
