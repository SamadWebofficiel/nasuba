import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_voyage_mobile/screens/login_screen.dart';
import 'package:nasuba_voyage_mobile/theme/theme.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
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
  runApp(const ProviderScope(child: NasubaApp()));
}

class NasubaApp extends StatelessWidget {
  const NasubaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NASUBA Voyage',
      debugShowCheckedModeBanner: false,
      theme: NasubaTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}
