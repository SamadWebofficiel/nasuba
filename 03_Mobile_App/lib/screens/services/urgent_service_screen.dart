import 'package:flutter/material.dart';

class UrgentServiceScreen extends StatefulWidget {
  const UrgentServiceScreen({super.key});

  @override
  State<UrgentServiceScreen> createState() => _UrgentServiceScreenState();
}

class _UrgentServiceScreenState extends State<UrgentServiceScreen> {
  final _passengersController = TextEditingController();
  final _destinationController = TextEditingController();
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Véhicule Urgent', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.red,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.red, size: 32),
                  SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'ATTENTION : Ce service ne remplace pas les services d\'urgence officiels (Sapeurs-Pompiers, SAMU). En cas de danger de mort, contactez les secours.',
                      style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text('Où êtes-vous ?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            // Placeholder pour la localisation automatique
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.my_location, color: Colors.blue),
                  SizedBox(width: 16),
                  Text('Localisation actuelle (GPS)'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: 'Destination (Optionnel)',
                prefixIcon: Icon(Icons.location_on),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _passengersController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Nombre de passagers',
                prefixIcon: Icon(Icons.group),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                // TODO: Soumettre la demande d'urgence
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Recherche d\'un véhicule en urgence...')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('DEMANDER UN VÉHICULE EN URGENCE', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
