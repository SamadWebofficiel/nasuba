class RegistrationData {
  // Step 1: Informations personnelles
  String? firstName;
  String? lastName;
  DateTime? dateOfBirth;
  String? gender;
  String? nationality;
  String? phone;
  String? email;
  String? mainCity;
  String? address;

  // Step 2: Vérification KYC
  String? verificationMethod; // 'ID' ou 'LICENSE'
  String? idFrontImagePath;
  String? idBackImagePath;
  String? selfieImagePath;

  // Step 3: Vérification du permis (si nécessaire)
  String? driverLicenseNumber;
  DateTime? driverLicenseExpiryDate;
  String? driverLicenseCategory;
  String? driverLicenseFrontImagePath;
  String? driverLicenseBackImagePath;

  // Step 4: Informations du véhicule
  String? vehicleType;
  String? vehicleBrand;
  String? vehicleModel;
  String? vehicleYear;
  String? vehiclePlate;
  int? vehicleSeats;
  String? vehicleMainCity;

  // Step 5: Services proposés
  List<String> servicesOffered;

  // Firebase Storage URLs (populated at step 6)
  String? idFrontUrl;
  String? idBackUrl;
  String? selfieUrl;
  String? driverLicenseFrontUrl;
  String? driverLicenseBackUrl;

  RegistrationData({
    this.firstName,
    this.lastName,
    this.dateOfBirth,
    this.gender,
    this.nationality,
    this.phone,
    this.email,
    this.mainCity,
    this.address,
    this.verificationMethod,
    this.idFrontImagePath,
    this.idBackImagePath,
    this.selfieImagePath,
    this.driverLicenseNumber,
    this.driverLicenseExpiryDate,
    this.driverLicenseCategory,
    this.driverLicenseFrontImagePath,
    this.driverLicenseBackImagePath,
    this.vehicleType,
    this.vehicleBrand,
    this.vehicleModel,
    this.vehicleYear,
    this.vehiclePlate,
    this.vehicleSeats,
    this.vehicleMainCity,
    this.servicesOffered = const [],
    this.idFrontUrl,
    this.idBackUrl,
    this.selfieUrl,
    this.driverLicenseFrontUrl,
    this.driverLicenseBackUrl,
  });

  RegistrationData copyWith({
    String? firstName,
    String? lastName,
    DateTime? dateOfBirth,
    String? gender,
    String? nationality,
    String? phone,
    String? email,
    String? mainCity,
    String? address,
    String? verificationMethod,
    String? idFrontImagePath,
    String? idBackImagePath,
    String? selfieImagePath,
    String? driverLicenseNumber,
    DateTime? driverLicenseExpiryDate,
    String? driverLicenseCategory,
    String? driverLicenseFrontImagePath,
    String? driverLicenseBackImagePath,
    String? vehicleType,
    String? vehicleBrand,
    String? vehicleModel,
    String? vehicleYear,
    String? vehiclePlate,
    int? vehicleSeats,
    String? vehicleMainCity,
    List<String>? servicesOffered,
    String? idFrontUrl,
    String? idBackUrl,
    String? selfieUrl,
    String? driverLicenseFrontUrl,
    String? driverLicenseBackUrl,
  }) {
    return RegistrationData(
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      nationality: nationality ?? this.nationality,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      mainCity: mainCity ?? this.mainCity,
      address: address ?? this.address,
      verificationMethod: verificationMethod ?? this.verificationMethod,
      idFrontImagePath: idFrontImagePath ?? this.idFrontImagePath,
      idBackImagePath: idBackImagePath ?? this.idBackImagePath,
      selfieImagePath: selfieImagePath ?? this.selfieImagePath,
      driverLicenseNumber: driverLicenseNumber ?? this.driverLicenseNumber,
      driverLicenseExpiryDate: driverLicenseExpiryDate ?? this.driverLicenseExpiryDate,
      driverLicenseCategory: driverLicenseCategory ?? this.driverLicenseCategory,
      driverLicenseFrontImagePath: driverLicenseFrontImagePath ?? this.driverLicenseFrontImagePath,
      driverLicenseBackImagePath: driverLicenseBackImagePath ?? this.driverLicenseBackImagePath,
      vehicleType: vehicleType ?? this.vehicleType,
      vehicleBrand: vehicleBrand ?? this.vehicleBrand,
      vehicleModel: vehicleModel ?? this.vehicleModel,
      vehicleYear: vehicleYear ?? this.vehicleYear,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      vehicleSeats: vehicleSeats ?? this.vehicleSeats,
      vehicleMainCity: vehicleMainCity ?? this.vehicleMainCity,
      servicesOffered: servicesOffered ?? this.servicesOffered,
      idFrontUrl: idFrontUrl ?? this.idFrontUrl,
      idBackUrl: idBackUrl ?? this.idBackUrl,
      selfieUrl: selfieUrl ?? this.selfieUrl,
      driverLicenseFrontUrl: driverLicenseFrontUrl ?? this.driverLicenseFrontUrl,
      driverLicenseBackUrl: driverLicenseBackUrl ?? this.driverLicenseBackUrl,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'nationality': nationality,
      'phone': phone,
      'email': email,
      'mainCity': mainCity,
      'address': address,
      'verificationMethod': verificationMethod,
      'driverLicenseNumber': driverLicenseNumber,
      'driverLicenseExpiryDate': driverLicenseExpiryDate?.toIso8601String(),
      'driverLicenseCategory': driverLicenseCategory,
      'vehicleType': vehicleType,
      'vehicleBrand': vehicleBrand,
      'vehicleModel': vehicleModel,
      'vehicleYear': vehicleYear,
      'vehiclePlate': vehiclePlate,
      'vehicleSeats': vehicleSeats,
      'vehicleMainCity': vehicleMainCity,
      'servicesOffered': servicesOffered,
      'idFrontUrl': idFrontUrl,
      'idBackUrl': idBackUrl,
      'selfieUrl': selfieUrl,
      'driverLicenseFrontUrl': driverLicenseFrontUrl,
      'driverLicenseBackUrl': driverLicenseBackUrl,
      'validationStatus': 'En attente',
      'confidenceLevel': _calculateConfidenceLevel(),
      'createdAt': DateTime.now().toIso8601String(),
    };
  }

  String _calculateConfidenceLevel() {
    if (firstName != null && lastName != null && idFrontUrl != null && selfieUrl != null) {
      return 'CONFIANCE ÉLEVÉE';
    }
    return 'CONFIANCE MOYENNE';
  }
}
