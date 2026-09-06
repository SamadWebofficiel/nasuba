import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

final firebaseAuthProvider = Provider<FirebaseAuth?>((ref) {
  try {
    return FirebaseAuth.instance;
  } catch (e) {
    return null;
  }
});
final firestoreProvider = Provider<FirebaseFirestore?>((ref) {
  try {
    return FirebaseFirestore.instance;
  } catch (e) {
    return null;
  }
});

final authStateProvider = StreamProvider<User?>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  if (auth == null) return Stream.value(null);
  return auth.authStateChanges();
});

class AuthNotifier extends StateNotifier<AsyncValue<void>> {
  final FirebaseAuth? _auth;
  final FirebaseFirestore? _firestore;
  String? _verificationId;

  AuthNotifier(this._auth, this._firestore) : super(const AsyncValue.data(null));

  Future<void> verifyPhone(String phoneNumber) async {
    if (_auth == null) {
      state = AsyncValue.error('Firebase non configuré', StackTrace.current);
      return;
    }
    state = const AsyncValue.loading();
    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _auth.signInWithCredential(credential);
          state = const AsyncValue.data(null);
        },
        verificationFailed: (FirebaseAuthException e) {
          state = AsyncValue.error(e, StackTrace.current);
        },
        codeSent: (String verificationId, int? resendToken) {
          _verificationId = verificationId;
          state = const AsyncValue.data(null);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          _verificationId = verificationId;
        },
      );
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> verifyOTP(String smsCode) async {
    if (_auth == null || _firestore == null) {
      state = AsyncValue.error('Firebase non configuré', StackTrace.current);
      return;
    }
    if (_verificationId == null) {
      state = AsyncValue.error('Erreur: Session expirée', StackTrace.current);
      return;
    }
    state = const AsyncValue.loading();
    try {
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );
      final userCredential = await _auth.signInWithCredential(credential);
      
      final user = userCredential.user;
      if (user != null) {
        final doc = await _firestore!.collection('users').doc(user.uid).get();
        if (!doc.exists) {
          await _firestore!.collection('users').doc(user.uid).set({
            'uid': user.uid,
            'phone': user.phoneNumber,
            'roles': ['DRIVER'],
            'vehicle': 'Standard', // Par défaut, modifiable par l'admin ou le profil
            'rating': 5.0,
            'isVerified': false, // En attente de validation par l'admin
            'createdAt': FieldValue.serverTimestamp(),
            'isActive': true,
          });
        }
      }
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signOut() async {
    if (_auth != null) {
      await _auth!.signOut();
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<void>>((ref) {
  return AuthNotifier(ref.watch(firebaseAuthProvider), ref.watch(firestoreProvider));
});
