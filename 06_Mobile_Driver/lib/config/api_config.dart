import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static const String baseUrlDevelopment = 'http://10.0.2.2:3000';
  static const String baseUrlStaging = 'https://nasuba-y3rh.onrender.com';
  static const String baseUrlProduction = 'https://api.nasuba.com'; // Placeholder

  static String get baseUrl {
    final envUrl = dotenv.env['API_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }
    return baseUrlStaging;
  }
}
