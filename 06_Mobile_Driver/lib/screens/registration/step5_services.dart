import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_driver_app/providers/registration_provider.dart';

class Step5Services extends ConsumerStatefulWidget {
  final VoidCallback onNext;

  const Step5Services({super.key, required this.onNext});

  @override
  ConsumerState<Step5Services> createState() => _Step5ServicesState();
}

class _Step5ServicesState extends ConsumerState<Step5Services> {
  final List<String> _availableServices = [
    'Transport quotidien',
    'Voyage',
    'Transport urgent',
    'Événements',
    'Transport médical autorisé',
    'Transport funéraire autorisé',
    'Transport de marchandises'
  ];

  final Set<String> _selectedServices = {};

  @override
  void initState() {
    super.initState();
    final data = ref.read(registrationProvider);
    _selectedServices.addAll(data.servicesOffered);
  }

  void _saveAndNext() {
    if (_selectedServices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Veuillez sélectionner au moins un service')));
      return;
    }
    ref.read(registrationProvider.notifier).updateServices(_selectedServices.toList());
    widget.onNext();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const Text(
          'Étape 5 — Choix des services',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Sélectionnez les services que vous souhaitez proposer. Remarque : les services spécialisés nécessitent des autorisations spécifiques qui seront vérifiées.',
          style: TextStyle(color: Colors.grey),
        ),
        const SizedBox(height: 16),
        ..._availableServices.map((service) {
          final isSelected = _selectedServices.contains(service);
          return CheckboxListTile(
            title: Text(service),
            value: isSelected,
            onChanged: (bool? value) {
              setState(() {
                if (value == true) {
                  _selectedServices.add(service);
                } else {
                  _selectedServices.remove(service);
                }
              });
            },
            controlAffinity: ListTileControlAffinity.leading,
            activeColor: Theme.of(context).primaryColor,
          );
        }),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _saveAndNext,
          child: const Text('Suivant'),
        ),
      ],
    );
  }
}
