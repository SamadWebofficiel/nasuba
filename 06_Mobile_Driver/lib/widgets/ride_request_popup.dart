import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_driver_app/providers/driver_status_provider.dart';

class RideRequestPopup extends ConsumerStatefulWidget {
  final Map<String, dynamic> rideData;
  const RideRequestPopup({super.key, required this.rideData});

  @override
  ConsumerState<RideRequestPopup> createState() => _RideRequestPopupState();
}

class _RideRequestPopupState extends ConsumerState<RideRequestPopup> {
  int _timeLeft = 15;
  Timer? _timer;
  final TextEditingController _counterOfferController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted && _timeLeft > 0) {
        setState(() => _timeLeft--);
      } else if (_timeLeft <= 0) {
        _timer?.cancel();
        if (mounted) Navigator.pop(context); // Auto-refuse
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _counterOfferController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final clientPrice = widget.rideData['pricing']?['estimatedAmount'] ?? 'Non spécifié';

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 50,
                height: 5,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(10)),
              ),
              const Icon(Icons.local_taxi, size: 64, color: Color(0xFF0F62FE)),
              const SizedBox(height: 8),
              const Text('Nouvelle Course !', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              
              // Timer Alert
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('Temps restant : $_timeLeft s', style: const TextStyle(fontSize: 16, color: Colors.red, fontWeight: FontWeight.bold)),
              ),
              
              const SizedBox(height: 8),
              
              // Infos Client & Prix
              Text('Client : ${widget.rideData['traveler']?['phone'] ?? "Inconnu"}', style: const TextStyle(fontSize: 16)),
              const SizedBox(height: 4),
              Text('Prix proposé : $clientPrice FCFA', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
              
              const SizedBox(height: 24),

              // Contre-proposition
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('Négocier le prix (Optionnel)', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _counterOfferController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Contre-proposition (FCFA)',
                  prefixIcon: const Icon(Icons.payments, color: Colors.green),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: Colors.grey[100],
                ),
              ),
              
              const SizedBox(height: 24),

              // Boutons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        _timer?.cancel();
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Colors.red),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Ignorer', style: TextStyle(color: Colors.red, fontSize: 16)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        _timer?.cancel();
                        
                        // Si une contre-proposition est faite, on l'ajoute dans rideData (logique V1 Espèces)
                        final proposedPrice = _counterOfferController.text.trim();
                        if (proposedPrice.isNotEmpty) {
                          widget.rideData['driverCounterOffer'] = proposedPrice;
                        }
                        
                        ref.read(driverStatusProvider.notifier).acceptRide(widget.rideData['rideId'], widget.rideData);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Course acceptée !')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF24A148), // Success Green
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Accepter', style: TextStyle(color: Colors.white, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
