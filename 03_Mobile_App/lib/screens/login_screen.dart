import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_voyage_mobile/providers/auth_provider.dart';
import 'package:nasuba_voyage_mobile/screens/main_layout.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  
  bool _isOtpSent = false;
  Timer? _timer;
  int _start = 60;

  @override
  void dispose() {
    _timer?.cancel();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _start = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer timer) {
      if (_start == 0) {
        setState(() {
          timer.cancel();
        });
      } else {
        setState(() {
          _start--;
        });
      }
    });
  }

  void _resendOtp() {
    setState(() {
      _isOtpSent = false;
      _otpController.clear();
    });
    _sendOtp();
  }

  void _sendOtp() {
    if (_formKey.currentState!.validate()) {
      // Préfixe +229 pour le Bénin et suppression de tous les espaces
      final rawPhone = _phoneController.text.replaceAll(' ', '');
      final phone = '+229$rawPhone';
      ref.read(authProvider.notifier).verifyPhone(phone);
    }
  }

  void _verifyOtp() {
    if (_otpController.text.length == 6) {
      ref.read(authProvider.notifier).verifyOTP(_otpController.text.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    
    // Écouter les changements d'état global (ex: si l'utilisateur est connecté)
    ref.listen<AsyncValue<void>>(authProvider, (previous, next) {
      next.whenOrNull(
        error: (err, stack) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err.toString()), backgroundColor: Colors.red),
          );
          setState(() {
            _isOtpSent = false; // Reset en cas d'erreur
          });
        },
        data: (_) {
          // Check if we have a user from authStateProvider
          final user = ref.read(authStateProvider).value;
          if (user != null) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const MainLayout()),
            );
          } else {
            // Le SMS a été envoyé avec succès, on affiche le champ du code
            setState(() {
              _isOtpSent = true;
            });
            _startTimer();
          }
        },
      );
    });

    final isLoading = authState.isLoading;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              // Header
              Text(
                _isOtpSent ? 'Code de vérification' : 'Bienvenue sur',
                style: Theme.of(context).textTheme.displayLarge,
              ),
              if (!_isOtpSent)
                Text(
                  'NASUBA Voyage',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              const SizedBox(height: 16),
              Text(
                _isOtpSent 
                  ? 'Entrez le code à 6 chiffres envoyé au +229 ${_phoneController.text}'
                  : 'Saisissez votre numéro pour continuer',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 48),
              
              // Formulaire
              Form(
                key: _formKey,
                child: _isOtpSent ? _buildOtpInput() : _buildPhoneInput(),
              ),
              
              const SizedBox(height: 32),
              
              // Bouton Principal
              ElevatedButton(
                onPressed: isLoading 
                  ? null 
                  : (_isOtpSent ? _verifyOtp : _sendOtp),
                child: isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : Text(_isOtpSent ? 'Vérifier' : 'Continuer'),
              ),
              
              if (_isOtpSent)
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: Center(
                    child: _start > 0
                        ? Text('Renvoyer le code dans $_start s', style: const TextStyle(color: Colors.grey))
                        : TextButton(
                            onPressed: _resendOtp,
                            child: const Text('Renvoyer le code', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                  ),
                ),
              
              const Spacer(),
              
              if (!_isOtpSent)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton(
                      onPressed: () {
                        // Logique Google/Apple Sign in plus tard
                      },
                      child: const Text('Autres options de connexion', style: TextStyle(color: Colors.grey)),
                    ),
                  ],
                ),
              // TEMPORAIRE POUR LE DEVELOPPEMENT :
              TextButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const MainLayout()),
                  );
                },
                child: const Text('🔧 Forcer l\'accès (Mode Dev)', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhoneInput() {
    return TextFormField(
      controller: _phoneController,
      keyboardType: TextInputType.phone,
      style: const TextStyle(fontSize: 18, letterSpacing: 1.5),
      decoration: InputDecoration(
        labelText: 'Numéro de téléphone',
        prefixIcon: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('🇧🇯', style: TextStyle(fontSize: 24)),
              const SizedBox(width: 8),
              const Text('+229', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Container(width: 1, height: 24, color: Colors.grey),
            ],
          ),
        ),
        hintText: '01 23 45 67 89',
      ),
      validator: (value) {
        if (value == null || value.isEmpty || value.replaceAll(' ', '').length < 8) {
          return 'Le numéro doit contenir au moins 8 chiffres';
        }
        return null;
      },
    );
  }

  Widget _buildOtpInput() {
    return TextFormField(
      controller: _otpController,
      keyboardType: TextInputType.number,
      textAlign: TextAlign.center,
      maxLength: 6,
      style: const TextStyle(fontSize: 24, letterSpacing: 8.0, fontWeight: FontWeight.bold),
      decoration: const InputDecoration(
        hintText: '------',
        counterText: '',
      ),
      onChanged: (val) {
        if (val.length == 6) {
          _verifyOtp();
        }
      },
    );
  }
}
