import 'package:flutter/material.dart';

class FuneralServiceScreen extends StatefulWidget {
  const FuneralServiceScreen({super.key});

  @override
  State<FuneralServiceScreen> createState() => _FuneralServiceScreenState();
}

class _FuneralServiceScreenState extends State<FuneralServiceScreen> {
  final _pickupController = TextEditingController();
  final _destinationController = TextEditingController();
  final _detailsController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transport Funéraire', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black87,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.gavel, color: Colors.black87, size: 32),
                  SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Information Légale : Le transport de corps est strictement réglementé. Seuls les prestataires habilités et vérifiés par NASUBA pourront répondre à cette demande.',
                      style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _pickupController,
              decoration: const InputDecoration(
                labelText: 'Lieu de prise en charge (Morgue, Hôpital, Domicile)',
                prefixIcon: Icon(Icons.location_on),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: 'Lieu de destination (Cimetière, Église, Domicile)',
                prefixIcon: Icon(Icons.place),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _detailsController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Informations complémentaires',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Demande envoyée aux prestataires habilités.')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black87,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('RECHERCHER UN PRESTATAIRE', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
