import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nasuba_voyage_mobile/screens/home_screen.dart';

class ActiveRideScreen extends StatelessWidget {
  final String rideId;

  const ActiveRideScreen({super.key, required this.rideId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Suivi de Course'),
        centerTitle: true,
        automaticallyImplyLeading: false, // Force on user to wait or cancel explicitly
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance.collection('rides').doc(rideId).snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(child: Text('Erreur de connexion.'));
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(child: Text('Course introuvable.'));
          }

          final data = snapshot.data!.data() as Map<String, dynamic>;
          final status = data['status'] ?? 'UNKNOWN';

          return _buildStatusView(context, status, data);
        },
      ),
    );
  }

  Widget _buildStatusView(BuildContext context, String status, Map<String, dynamic> data) {
    switch (status) {
      case 'PENDING':
      case 'SEARCHING':
        return _buildSearchingView(context);
      case 'ACCEPTED':
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_ARRIVING':
        return _buildDriverAssignedView(context, status, data);
      case 'DRIVER_ARRIVED':
        return _buildDriverArrivedView(context, data);
      case 'TRIP_STARTED':
        return _buildTripStartedView(context, data);
      case 'COMPLETED':
        return _buildCompletedView(context, data);
      case 'CANCELLED_BY_DRIVER':
      case 'CANCELLED_BY_TRAVELER':
        return _buildCancelledView(context, status);
      default:
        return Center(child: Text('Statut inconnu : $status'));
    }
  }

  Widget _buildSearchingView(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 24),
          const Text('Recherche d\'un chauffeur à proximité...', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Veuillez patienter...'),
          const SizedBox(height: 32),
          TextButton(
            onPressed: () {
              // TODO: Appeler API pour annuler (CANCELLED_BY_TRAVELER)
              FirebaseFirestore.instance.collection('rides').doc(rideId).update({
                'status': 'CANCELLED_BY_TRAVELER'
              });
            },
            child: const Text('Annuler la demande', style: TextStyle(color: Colors.red)),
          )
        ],
      ),
    );
  }

  Widget _buildDriverAssignedView(BuildContext context, String status, Map<String, dynamic> data) {
    final driver = data['driver'] ?? {};
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 64),
            const SizedBox(height: 24),
            Text(status == 'DRIVER_ARRIVING' ? 'Votre chauffeur est en route !' : 'Chauffeur trouvé !', 
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(driver['name'] ?? 'Chauffeur NASUBA'),
                subtitle: Text('${driver['vehiclePlate'] ?? 'Véhicule'} - ${driver['phone'] ?? ''}'),
                trailing: IconButton(
                  icon: const Icon(Icons.call, color: Colors.green),
                  onPressed: () {}, // Lancer appel
                ),
              ),
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: () {
                 FirebaseFirestore.instance.collection('rides').doc(rideId).update({
                  'status': 'CANCELLED_BY_TRAVELER'
                });
              },
              child: const Text('Annuler la course', style: TextStyle(color: Colors.red)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDriverArrivedView(BuildContext context, Map<String, dynamic> data) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.hail, color: Colors.blue, size: 64),
          const SizedBox(height: 24),
          const Text('Le chauffeur est arrivé !', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Veuillez le rejoindre au point de départ.'),
        ],
      ),
    );
  }

  Widget _buildTripStartedView(BuildContext context, Map<String, dynamic> data) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.directions_car, color: Colors.blue, size: 64),
          const SizedBox(height: 24),
          const Text('Course en cours', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Bon voyage avec NASUBA !'),
        ],
      ),
    );
  }

  Widget _buildCompletedView(BuildContext context, Map<String, dynamic> data) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.stars, color: Colors.amber, size: 64),
            const SizedBox(height: 24),
            const Text('Course terminée !', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Prix payé : ${data['pricing']?['estimatedAmount'] ?? 0} FCFA (Espèces)', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const HomeScreen()),
                  (route) => false,
                );
              },
              child: const Text('Retour à l\'accueil'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCancelledView(BuildContext context, String status) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cancel, color: Colors.red, size: 64),
          const SizedBox(height: 24),
          const Text('Course annulée', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.red)),
          const SizedBox(height: 8),
          Text(status == 'CANCELLED_BY_DRIVER' ? 'Le chauffeur a annulé la course.' : 'Vous avez annulé la course.'),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => const HomeScreen()),
                (route) => false,
              );
            },
            child: const Text('Retour à l\'accueil'),
          )
        ],
      ),
    );
  }
}
