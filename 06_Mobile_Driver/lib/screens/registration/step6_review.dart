import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_driver_app/providers/registration_provider.dart';

class Step6Review extends ConsumerStatefulWidget {
  final VoidCallback onSubmit;

  const Step6Review({super.key, required this.onSubmit});

  @override
  ConsumerState<Step6Review> createState() => _Step6ReviewState();
}

class _Step6ReviewState extends ConsumerState<Step6Review> {
  bool _isSubmitting = false;

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      await ref.read(registrationProvider.notifier).submitRegistration();
      widget.onSubmit();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: \$e')));
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = ref.watch(registrationProvider);

    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const Text(
          'Étape 6 — Vérification finale',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          color: Colors.green[50],
          child: const Text(
            "Veuillez vérifier vos informations avant de soumettre. Votre dossier sera analysé par un administrateur.",
            style: TextStyle(color: Colors.green),
          ),
        ),
        const SizedBox(height: 24),
        
        _buildSectionTitle('Informations personnelles'),
        _buildReviewRow('Nom complet', '\${data.firstName} \${data.lastName}'),
        _buildReviewRow('Ville', data.mainCity ?? ''),
        _buildReviewRow('Adresse', data.address ?? 'Non spécifiée'),

        const Divider(height: 32),
        _buildSectionTitle('Méthode de vérification'),
        _buildReviewRow('Document KYC', data.verificationMethod ?? ''),
        _buildReviewRow('Documents joints', '\${data.idFrontImagePath != null ? "Recto, " : ""}Selfie'),
        
        if (data.driverLicenseNumber != null && data.driverLicenseNumber!.isNotEmpty) ...[
          const Divider(height: 32),
          _buildSectionTitle('Permis de conduire'),
          _buildReviewRow('Numéro', data.driverLicenseNumber!),
          _buildReviewRow('Catégorie', data.driverLicenseCategory ?? ''),
        ],

        const Divider(height: 32),
        _buildSectionTitle('Véhicule'),
        _buildReviewRow('Type', data.vehicleType ?? ''),
        _buildReviewRow('Modèle', '\${data.vehicleBrand} \${data.vehicleModel}'),
        _buildReviewRow('Immatriculation', data.vehiclePlate ?? ''),

        const Divider(height: 32),
        _buildSectionTitle('Services proposés'),
        Wrap(
          spacing: 8,
          children: data.servicesOffered.map((s) => Chip(label: Text(s))).toList(),
        ),

        const SizedBox(height: 48),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: _isSubmitting 
              ? const CircularProgressIndicator(color: Colors.white) 
              : const Text('Soumettre le dossier', style: TextStyle(fontSize: 16, color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.blueGrey)),
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 2, child: Text(label, style: const TextStyle(color: Colors.grey))),
          Expanded(flex: 3, child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
