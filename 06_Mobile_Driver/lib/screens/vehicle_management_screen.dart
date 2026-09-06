import 'package:flutter/material.dart';

class VehicleManagementScreen extends StatefulWidget {
  const VehicleManagementScreen({super.key});

  @override
  State<VehicleManagementScreen> createState() => _VehicleManagementScreenState();
}

class _VehicleManagementScreenState extends State<VehicleManagementScreen> {
  final List<Map<String, dynamic>> _myVehicles = [
    {
      'id': '1',
      'type': 'Taxi / Voyage',
      'brand': 'Toyota Corolla',
      'plate': 'AB 1234 RB',
      'status': 'Actif',
      'icon': Icons.local_taxi,
      'color': const Color(0xFF0F62FE),
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250.0,
            floating: false,
            pinned: true,
            backgroundColor: Theme.of(context).primaryColor,
            iconTheme: const IconThemeData(color: Colors.white),
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
            ),
            flexibleSpace: FlexibleSpaceBar(
              title: const Text('Mes Véhicules & Services', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    'assets/images/promo_banner.jpg',
                    fit: BoxFit.cover,
                    alignment: Alignment.center,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.8),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  if (index == _myVehicles.length) {
                    return _buildAddVehicleButton();
                  }
                  final vehicle = _myVehicles[index];
                  return _buildVehicleCard(vehicle);
                },
                childCount: _myVehicles.length + 1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCard(Map<String, dynamic> vehicle) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: vehicle['color'].withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(vehicle['icon'], color: vehicle['color'], size: 32),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(vehicle['type'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text('${vehicle['brand']} - ${vehicle['plate']}', style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      vehicle['status'],
                      style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.grey),
              onPressed: () {
                // TODO: Modifier le véhicule
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddVehicleButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: OutlinedButton.icon(
        onPressed: () {
          _showAddVehicleDialog();
        },
        icon: const Icon(Icons.add),
        label: const Text('Ajouter un véhicule / service'),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.all(16),
          side: BorderSide(color: Theme.of(context).primaryColor),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  void _showAddVehicleDialog() {
    String? selectedService;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Nouveau Véhicule', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Type de service', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'Taxi / Voyage', child: Text('Taxi / Voyage (Voiture standard)')),
                  DropdownMenuItem(value: 'Urgence', child: Text('Urgence (Transport rapide)')),
                  DropdownMenuItem(value: 'Événementiel', child: Text('Événementiel (Van, Limousine...)')),
                  DropdownMenuItem(value: 'Médical', child: Text('Médical (Ambulance, VSL)')),
                  DropdownMenuItem(value: 'Funéraire', child: Text('Funéraire (Corbillard)')),
                  DropdownMenuItem(value: 'Marchandise', child: Text('Marchandise (Camion, Fourgon)')),
                ],
                onChanged: (val) {
                  selectedService = val;
                },
              ),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(labelText: 'Marque et Modèle', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(labelText: 'Plaque d\'immatriculation', border: OutlineInputBorder())),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Demande d\'ajout envoyée pour validation.')));
                },
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Soumettre à validation'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
