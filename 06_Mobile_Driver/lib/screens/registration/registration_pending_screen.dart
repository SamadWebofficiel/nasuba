import 'package:flutter/material.dart';

class RegistrationPendingScreen extends StatelessWidget {
  const RegistrationPendingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NASUBA Chauffeur'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.hourglass_empty, size: 80, color: Colors.orange),
            const SizedBox(height: 32),
            const Text(
              'En attente de validation',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            const Text(
              'Vos documents ont été vérifiés avec succès et enregistrés.\n\nLes informations fournies sont cohérentes avec les contrôles disponibles. Votre dossier est maintenant en attente de validation finale par l\'administration.',
              style: TextStyle(fontSize: 16, color: Colors.blueGrey, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                // Pour l'instant, on laisse l'utilisateur ici. Il pourrait y avoir un bouton de rafraichissement ou on écoute Firestore
              },
              child: const Text('Rafraîchir le statut'),
            ),
          ],
        ),
      ),
    );
  }
}
