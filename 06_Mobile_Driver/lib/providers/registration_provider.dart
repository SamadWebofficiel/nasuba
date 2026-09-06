import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nasuba_driver_app/models/registration_data.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:io';

final registrationProvider = StateNotifierProvider<RegistrationNotifier, RegistrationData>((ref) {
  return RegistrationNotifier();
});

class RegistrationNotifier extends StateNotifier<RegistrationData> {
  RegistrationNotifier() : super(RegistrationData());

  void updateData(RegistrationData data) {
    state = data;
  }

  void updatePersonalInfo({
    String? firstName,
    String? lastName,
    DateTime? dateOfBirth,
    String? gender,
    String? nationality,
    String? mainCity,
    String? address,
  }) {
    state = state.copyWith(
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth,
      gender: gender,
      nationality: nationality,
      mainCity: mainCity,
      address: address,
    );
  }

  void updateVerificationMethod(String method) {
    state = state.copyWith(verificationMethod: method);
  }

  void updateImages({
    String? idFront,
    String? idBack,
    String? selfie,
  }) {
    state = state.copyWith(
      idFrontImagePath: idFront,
      idBackImagePath: idBack,
      selfieImagePath: selfie,
    );
  }

  void updateLicense({
    String? licenseNumber,
    DateTime? expiryDate,
    String? category,
    String? frontPath,
    String? backPath,
  }) {
    state = state.copyWith(
      driverLicenseNumber: licenseNumber,
      driverLicenseExpiryDate: expiryDate,
      driverLicenseCategory: category,
      driverLicenseFrontImagePath: frontPath,
      driverLicenseBackImagePath: backPath,
    );
  }

  void updateVehicle({
    String? type,
    String? brand,
    String? model,
    String? year,
    String? plate,
    int? seats,
  }) {
    state = state.copyWith(
      vehicleType: type,
      vehicleBrand: brand,
      vehicleModel: model,
      vehicleYear: year,
      vehiclePlate: plate,
      vehicleSeats: seats,
    );
  }

  void updateServices(List<String> services) {
    state = state.copyWith(servicesOffered: services);
  }

  Future<void> submitRegistration() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw Exception("Utilisateur non connecté");

    // 1. Upload images to Firebase Storage
    String? idFrontUrl = await _uploadImage(state.idFrontImagePath, 'kyc/${user.uid}/id_front.jpg');
    String? idBackUrl = await _uploadImage(state.idBackImagePath, 'kyc/${user.uid}/id_back.jpg');
    String? selfieUrl = await _uploadImage(state.selfieImagePath, 'kyc/${user.uid}/selfie.jpg');
    String? licenseFrontUrl = await _uploadImage(state.driverLicenseFrontImagePath, 'kyc/${user.uid}/license_front.jpg');
    String? licenseBackUrl = await _uploadImage(state.driverLicenseBackImagePath, 'kyc/${user.uid}/license_back.jpg');

    // 2. Update state with URLs
    state = state.copyWith(
      phone: user.phoneNumber,
      email: user.email,
      idFrontUrl: idFrontUrl,
      idBackUrl: idBackUrl,
      selfieUrl: selfieUrl,
      driverLicenseFrontUrl: licenseFrontUrl,
      driverLicenseBackUrl: licenseBackUrl,
    );

    // 3. Save to Firestore
    await FirebaseFirestore.instance.collection('drivers').doc(user.uid).set(state.toMap());
  }

  Future<String?> _uploadImage(String? path, String storagePath) async {
    if (path == null || path.isEmpty) return null;
    File file = File(path);
    if (!await file.exists()) return null;

    try {
      final ref = FirebaseStorage.instance.ref().child(storagePath);
      final uploadTask = await ref.putFile(file);
      return await uploadTask.ref.getDownloadURL();
    } catch (e) {
      print("Erreur upload image: \$e");
      return null;
    }
  }
}
