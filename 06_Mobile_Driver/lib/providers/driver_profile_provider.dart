import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:nasuba_driver_app/providers/auth_provider.dart';

final driverProfileStreamProvider = StreamProvider<DocumentSnapshot?>((ref) {
  final user = ref.watch(authStateProvider).value;
  final firestore = ref.watch(firestoreProvider);
  
  if (user == null || firestore == null) {
    return Stream.value(null);
  }

  return firestore.collection('drivers').doc(user.uid).snapshots();
});
