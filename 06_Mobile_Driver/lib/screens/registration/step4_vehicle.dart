import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_driver_app/providers/registration_provider.dart';

class Step4Vehicle extends ConsumerStatefulWidget {
  final VoidCallback onNext;

  const Step4Vehicle({super.key, required this.onNext});

  @override
  ConsumerState<Step4Vehicle> createState() => _Step4VehicleState();
}

class _Step4VehicleState extends ConsumerState<Step4Vehicle> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _brandController;
  late TextEditingController _modelController;
  late TextEditingController _yearController;
  late TextEditingController _plateController;
  late TextEditingController _seatsController;
  
  String _vehicleType = 'Voiture de transport';

  final List<String> _vehicleTypes = [
    'Taxi',
    'Voiture de transport',
    'Minibus',
    'Bus',
    'Véhicule événementiel',
    'Véhicule de transport médical autorisé',
    'Véhicule funéraire autorisé',
    'Petit camion',
    'Camion',
    'Véhicule spécialisé'
  ];

  @override
  void initState() {
    super.initState();
    final data = ref.read(registrationProvider);
    if (data.vehicleType != null && _vehicleTypes.contains(data.vehicleType)) {
      _vehicleType = data.vehicleType!;
    }
    _brandController = TextEditingController(text: data.vehicleBrand);
    _modelController = TextEditingController(text: data.vehicleModel);
    _yearController = TextEditingController(text: data.vehicleYear);
    _plateController = TextEditingController(text: data.vehiclePlate);
    _seatsController = TextEditingController(text: data.vehicleSeats?.toString());
  }

  @override
  void dispose() {
    _brandController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _plateController.dispose();
    _seatsController.dispose();
    super.dispose();
  }

  void _saveAndNext() {
    if (_formKey.currentState!.validate()) {
      ref.read(registrationProvider.notifier).updateVehicle(
        type: _vehicleType,
        brand: _brandController.text,
        model: _modelController.text,
        year: _yearController.text,
        plate: _plateController.text,
        seats: int.tryParse(_seatsController.text),
      );
      widget.onNext();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Text(
            'Étape 4 — Informations du véhicule',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _vehicleType,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Type de véhicule', border: OutlineInputBorder()),
            items: _vehicleTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
            onChanged: (val) {
              setState(() => _vehicleType = val!);
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _brandController,
            decoration: const InputDecoration(labelText: 'Marque (Ex: Toyota)', border: OutlineInputBorder()),
            validator: (v) => v!.isEmpty ? 'Requis' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _modelController,
            decoration: const InputDecoration(labelText: 'Modèle (Ex: Corolla)', border: OutlineInputBorder()),
            validator: (v) => v!.isEmpty ? 'Requis' : null,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _yearController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Année', border: OutlineInputBorder()),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  controller: _seatsController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Nombre de places', border: OutlineInputBorder()),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _plateController,
            decoration: const InputDecoration(labelText: 'Plaque d\'immatriculation', border: OutlineInputBorder()),
            validator: (v) => v!.isEmpty ? 'Requis' : null,
          ),
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
