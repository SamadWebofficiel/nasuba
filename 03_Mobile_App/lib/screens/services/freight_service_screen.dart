import 'package:flutter/material.dart';

class FreightServiceScreen extends StatefulWidget {
  const FreightServiceScreen({super.key});

  @override
  State<FreightServiceScreen> createState() => _FreightServiceScreenState();
}

class _FreightServiceScreenState extends State<FreightServiceScreen> {
  final _pickupController = TextEditingController();
  final _destinationController = TextEditingController();
  final _weightController = TextEditingController();
  final _detailsController = TextEditingController();
  String? _selectedTruckType;

  final List<String> _truckTypes = [
    'Petit Fourgon (Camionnette)',
    'Camion Plateau',
    'Camion Citerne',
    'Camion Frigorifique',
    'Poids Lourd (> 3.5T)',
    'Autre'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Camion / Marchandises', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.orange,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Transport de marchandises',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orange),
            ),
            const SizedBox(height: 8),
            const Text(
              'Trouvez le camion adapté à votre cargaison et demandez un devis.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            DropdownButtonFormField<String>(
              value: _selectedTruckType,
              decoration: const InputDecoration(
                labelText: 'Type de camion requis',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.local_shipping, color: Colors.orange),
              ),
              items: _truckTypes.map((type) {
                return DropdownMenuItem(value: type, child: Text(type));
              }).toList(),
              onChanged: (val) {
                setState(() {
                  _selectedTruckType = val;
                });
              },
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _pickupController,
              decoration: const InputDecoration(
                labelText: 'Lieu de chargement',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: 'Lieu de déchargement',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.flag),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _weightController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Poids estimé (en Tonnes)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.monitor_weight),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _detailsController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Nature de la marchandise',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Demande de devis envoyée avec succès !')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('DEMANDER UN DEVIS', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
