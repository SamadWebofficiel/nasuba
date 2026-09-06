import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:nasuba_driver_app/screens/driver_screen.dart';
import 'package:nasuba_driver_app/screens/login_screen.dart';
import 'package:nasuba_driver_app/screens/registration/registration_main_screen.dart';
import 'package:nasuba_driver_app/screens/registration/registration_pending_screen.dart';
import 'package:nasuba_driver_app/theme/theme.dart';
import 'package:nasuba_driver_app/providers/auth_provider.dart';
import 'package:nasuba_driver_app/providers/driver_profile_provider.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Chargement des variables d'environnement pour STAGING
    await dotenv.load(fileName: ".env.staging");
  } catch (e) {
    print('Attention: Fichier .env manquant ou erreur de chargement.');
  }

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    print('Attention: Firebase n\'est pas configuré. Veuillez exécuter "flutterfire configure".');
  }
  runApp(const ProviderScope(child: NasubaDriverApp()));
}

class NasubaDriverApp extends ConsumerWidget {
  const NasubaDriverApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'NASUBA Driver',
      debugShowCheckedModeBanner: false,
      theme: NasubaTheme.lightTheme,
      home: authState.when(
        data: (user) {
          if (user == null) {
            return const LoginScreen();
          }

          // User is authenticated, check their driver profile
          final profileState = ref.watch(driverProfileStreamProvider);

          return profileState.when(
            data: (doc) {
              if (doc == null || !doc.exists) {
                // No profile found => Needs to register
                return const RegistrationMainScreen();
              }

              final data = doc.data() as Map<String, dynamic>?;
              final status = data?['validationStatus'] ?? 'En attente';

              if (status == 'Validé' || status == 'approved' || status == 'Actif') {
                return const DriverScreen();
              } else if (status == 'Refusé' || status == 'Suspendu' || status == 'rejected' || status == 'suspended') {
                return const Scaffold(
                  body: Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Text(
                        'Votre compte a été suspendu ou refusé. Veuillez contacter le support NASUBA.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.red, fontSize: 18),
                      ),
                    ),
                  ),
                );
              } else {
                // Any other status (Pending, missing, etc.)
                return const RegistrationPendingScreen();
              }
            },
            loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
            error: (e, st) => Scaffold(body: Center(child: Text('Erreur: \$e'))),
          );
        },
        loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
        error: (_, __) => const LoginScreen(),
      ),
    );
  }
}
