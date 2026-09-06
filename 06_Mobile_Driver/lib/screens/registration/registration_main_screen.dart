import 'package:flutter/material.dart';
import 'package:nasuba_driver_app/screens/registration/step1_personal_info.dart';
import 'package:nasuba_driver_app/screens/registration/step2_kyc.dart';
import 'package:nasuba_driver_app/screens/registration/step3_license.dart';
import 'package:nasuba_driver_app/screens/registration/step4_vehicle.dart';
import 'package:nasuba_driver_app/screens/registration/step5_services.dart';
import 'package:nasuba_driver_app/screens/registration/step6_review.dart';
import 'package:nasuba_driver_app/screens/registration/registration_pending_screen.dart';

class RegistrationMainScreen extends StatefulWidget {
  const RegistrationMainScreen({super.key});

  @override
  State<RegistrationMainScreen> createState() => _RegistrationMainScreenState();
}

class _RegistrationMainScreenState extends State<RegistrationMainScreen> {
  int _currentStep = 0;

  void _nextStep() {
    if (_currentStep < 5) {
      setState(() => _currentStep++);
    } else {
      // Completed, go to pending screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const RegistrationPendingScreen()),
      );
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget stepWidget;
    switch (_currentStep) {
      case 0:
        stepWidget = Step1PersonalInfo(onNext: _nextStep);
        break;
      case 1:
        stepWidget = Step2KYC(onNext: _nextStep);
        break;
      case 2:
        stepWidget = Step3License(onNext: _nextStep);
        break;
      case 3:
        stepWidget = Step4Vehicle(onNext: _nextStep);
        break;
      case 4:
        stepWidget = Step5Services(onNext: _nextStep);
        break;
      case 5:
        stepWidget = Step6Review(onSubmit: _nextStep);
        break;
      default:
        stepWidget = Container();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inscription Chauffeur'),
        leading: _currentStep > 0
            ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: _prevStep)
            : null,
      ),
      body: Column(
        children: [
          LinearProgressIndicator(
            value: (_currentStep + 1) / 6,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).primaryColor),
          ),
          Expanded(child: stepWidget),
        ],
      ),
    );
  }
}
