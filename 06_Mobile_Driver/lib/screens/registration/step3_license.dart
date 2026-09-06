import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:nasuba_driver_app/providers/registration_provider.dart';

class Step3License extends ConsumerStatefulWidget {
  final VoidCallback onNext;

  const Step3License({super.key, required this.onNext});

  @override
  ConsumerState<Step3License> createState() => _Step3LicenseState();
}

class _Step3LicenseState extends ConsumerState<Step3License> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _licenseNumberController;
  late TextEditingController _categoryController;
  DateTime? _expiryDate;
  
  String? _frontPath;
  String? _backPath;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final data = ref.read(registrationProvider);
    _licenseNumberController = TextEditingController(text: data.driverLicenseNumber);
    _categoryController = TextEditingController(text: data.driverLicenseCategory);
    _expiryDate = data.driverLicenseExpiryDate;
    _frontPath = data.driverLicenseFrontImagePath;
    _backPath = data.driverLicenseBackImagePath;
  }

  @override
  void dispose() {
    _licenseNumberController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(String type) async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (image != null) {
      setState(() {
        if (type == 'front') _frontPath = image.path;
        if (type == 'back') _backPath = image.path;
      });
    }
  }

  void _saveAndNext() {
    // If they provided a license number, they should provide the expiry date and photo
    if (_licenseNumberController.text.isNotEmpty) {
      if (_expiryDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Veuillez renseigner la date d\'expiration')));
        return;
      }
      if (_frontPath == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Veuillez fournir une photo du permis')));
        return;
      }
    }

    if (_formKey.currentState!.validate()) {
      ref.read(registrationProvider.notifier).updateLicense(
        licenseNumber: _licenseNumberController.text,
        category: _categoryController.text,
        expiryDate: _expiryDate,
        frontPath: _frontPath,
        backPath: _backPath,
      );
      widget.onNext();
    }
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
            height: 120,
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
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Text(
            'Étape 3 — Vérification du permis',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Cette étape est obligatoire si vous conduisez un véhicule nécessitant un permis (voiture, camion, etc.)',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _licenseNumberController,
            decoration: const InputDecoration(labelText: 'Numéro du permis', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _categoryController,
            decoration: const InputDecoration(labelText: 'Catégorie (Ex: B, C, D)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          ListTile(
            title: Text(_expiryDate == null ? 'Date d\'expiration' : 'Expire le: \${_expiryDate!.toLocal().toString().split(' ')[0]}'),
            trailing: const Icon(Icons.calendar_today),
            shape: RoundedRectangleBorder(side: const BorderSide(color: Colors.grey), borderRadius: BorderRadius.circular(4)),
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime.now().add(const Duration(days: 365)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 3650)),
              );
              if (picked != null) {
                setState(() => _expiryDate = picked);
              }
            },
          ),
          const SizedBox(height: 16),
          _buildImageSelector('Photo nette du recto du permis', 'front', _frontPath),
          _buildImageSelector('Photo nette du verso (Optionnel)', 'back', _backPath),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _saveAndNext,
            child: const Text('Suivant'),
          ),
        ],
      ),
    );
  }
}
