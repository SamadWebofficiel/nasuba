import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:nasuba_driver_app/providers/registration_provider.dart';

class Step2KYC extends ConsumerStatefulWidget {
  final VoidCallback onNext;

  const Step2KYC({super.key, required this.onNext});

  @override
  ConsumerState<Step2KYC> createState() => _Step2KYCState();
}

class _Step2KYCState extends ConsumerState<Step2KYC> {
  String _selectedMethod = 'CNI'; // ou 'PERMIS'
  String? _idFrontPath;
  String? _idBackPath;
  String? _selfiePath;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final data = ref.read(registrationProvider);
    if (data.verificationMethod != null) {
      _selectedMethod = data.verificationMethod!;
    }
    _idFrontPath = data.idFrontImagePath;
    _idBackPath = data.idBackImagePath;
    _selfiePath = data.selfieImagePath;
  }

  Future<void> _pickImage(String type) async {
    final XFile? image = await _picker.pickImage(
      source: type == 'selfie' ? ImageSource.camera : ImageSource.gallery,
      imageQuality: 80,
    );
    if (image != null) {
      setState(() {
        if (type == 'front') _idFrontPath = image.path;
        if (type == 'back') _idBackPath = image.path;
        if (type == 'selfie') _selfiePath = image.path;
      });
    }
  }

  void _saveAndNext() {
    if (_idFrontPath == null || _selfiePath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez fournir au moins le recto et un selfie')),
      );
      return;
    }
    ref.read(registrationProvider.notifier).updateVerificationMethod(_selectedMethod);
    ref.read(registrationProvider.notifier).updateImages(
      idFront: _idFrontPath,
      idBack: _idBackPath,
      selfie: _selfiePath,
    );
    widget.onNext();
  }

  Widget _buildImageSelector(String title, String type, String? currentPath) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        InkWell(
          onTap: () => _pickImage(type),
          child: Container(
            height: 150,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey),
            ),
            child: currentPath == null
                ? const Center(child: Icon(Icons.add_a_photo, size: 40, color: Colors.grey))
                : Image.file(File(currentPath), fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const Text(
          'Étape 2 — Vérification KYC',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        const Text('Méthode de vérification d\'identité :'),
        DropdownButtonFormField<String>(
          value: _selectedMethod,
          items: const [
            DropdownMenuItem(value: 'CNI', child: Text("Carte Nationale d'Identité")),
            DropdownMenuItem(value: 'PERMIS', child: Text("Permis de Conduire")),
          ],
          onChanged: (val) {
            setState(() {
              _selectedMethod = val!;
            });
          },
          decoration: const InputDecoration(border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          color: Colors.blue[50],
          child: const Text(
            "Assurez-vous que votre document est valide, lisible et que toutes les informations sont visibles. Évitez les reflets et le flou.",
            style: TextStyle(color: Colors.blueGrey),
          ),
        ),
        const SizedBox(height: 16),
        _buildImageSelector('Photo nette du recto', 'front', _idFrontPath),
        _buildImageSelector('Photo nette du verso (Optionnel)', 'back', _idBackPath),
        _buildImageSelector('Selfie pour vérification d\'identité', 'selfie', _selfiePath),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _saveAndNext,
          child: const Text('Suivant'),
        ),
      ],
    );
  }
}
