import 'package:flutter/material.dart';

class QuotesManagementScreen extends StatefulWidget {
  const QuotesManagementScreen({super.key});

  @override
  State<QuotesManagementScreen> createState() => _QuotesManagementScreenState();
}

class _QuotesManagementScreenState extends State<QuotesManagementScreen> {
  // Simuler des demandes de devis reçues par le chauffeur
  final List<Map<String, dynamic>> _pendingQuotes = [
    {
      'id': 'Q-001',
      'service': 'Événementiel (Mariage)',
      'date': '12/10/2026',
      'time': '14:00',
      'location': 'Cotonou, Salle des fêtes',
      'details': 'Besoin d\'un van pour transporter 8 invités.',
      'status': 'En attente',
    },
    {
      'id': 'Q-002',
      'service': 'Marchandise (Camion)',
      'date': '15/10/2026',
      'time': '08:00',
      'location': 'Port de Cotonou',
      'details': 'Transport de 2 tonnes de ciment vers Porto-Novo.',
      'status': 'En attente',
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Mes Devis en Attente', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: _pendingQuotes.isEmpty
          ? const Center(
              child: Text('Aucune demande de devis pour le moment.', style: TextStyle(color: Colors.grey)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _pendingQuotes.length,
              itemBuilder: (context, index) {
                final quote = _pendingQuotes[index];
                return _buildQuoteCard(quote);
              },
            ),
    );
  }

  Widget _buildQuoteCard(Map<String, dynamic> quote) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    quote['service'],
                    style: const TextStyle(color: Colors.purple, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
                Text('#${quote['id']}', style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text('${quote['date']} à ${quote['time']}', style: const TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Expanded(child: Text(quote['location'], style: const TextStyle(fontWeight: FontWeight.w600))),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(8)),
              child: Text(quote['details'], style: TextStyle(color: Colors.grey[800], fontStyle: FontStyle.italic)),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      // TODO: Refuser
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Refuser'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      _showProposePriceDialog(quote['id']);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).primaryColor,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Proposer un prix', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showProposePriceDialog(String quoteId) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Proposer un prix'),
          content: const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Prix proposé (XOF)',
              border: OutlineInputBorder(),
              suffixText: 'FCFA',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Devis envoyé au client avec succès !')));
                setState(() {
                  _pendingQuotes.removeWhere((q) => q['id'] == quoteId);
                });
              },
              child: const Text('Envoyer l\'offre', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
