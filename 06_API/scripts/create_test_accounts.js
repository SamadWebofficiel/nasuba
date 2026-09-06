require('dotenv').config({ path: '../.env' }); // Load if needed
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with application default or env var
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
} else {
  initializeApp();
}

const auth = getAuth();
const db = getFirestore();

async function createTestAccounts() {
  console.log("Démarrage de la création des comptes de TEST...");

  // 1. Voyageur Test
  const voyageurEmail = 'voyageur.test@nasuba.com';
  const voyageurPassword = 'Password123!';
  let voyageurUid;

  try {
    const userRecord = await auth.createUser({
      email: voyageurEmail,
      password: voyageurPassword,
      displayName: 'Voyageur Test',
    });
    voyageurUid = userRecord.uid;
    console.log(`[OK] Voyageur Test créé. UID: ${voyageurUid}`);

    await db.collection('users').doc(voyageurUid).set({
      name: 'Voyageur Test',
      email: voyageurEmail,
      phone: '+229 00000001',
      role: 'TRAVELER',
      createdAt: new Date(),
    });
    console.log(`[OK] Profil Firestore Voyageur créé.`);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      const user = await auth.getUserByEmail(voyageurEmail);
      voyageurUid = user.uid;
      console.log(`[INFO] Voyageur Test existe déjà (UID: ${voyageurUid}).`);
    } else {
      console.error(`[ERREUR] Voyageur Test:`, error);
    }
  }

  // 2. Chauffeur Test
  const chauffeurEmail = 'chauffeur.test@nasuba.com';
  const chauffeurPassword = 'Password123!';
  let chauffeurUid;

  try {
    const driverRecord = await auth.createUser({
      email: chauffeurEmail,
      password: chauffeurPassword,
      displayName: 'Chauffeur Test',
    });
    chauffeurUid = driverRecord.uid;
    console.log(`[OK] Chauffeur Test créé. UID: ${chauffeurUid}`);

    await db.collection('drivers').doc(chauffeurUid).set({
      firstName: 'Chauffeur',
      lastName: 'Test',
      email: chauffeurEmail,
      phone: '+229 00000002',
      vehiclePlate: 'TEST-1234',
      vehicleType: 'Voiture',
      validationStatus: 'Validé', // Important pour passer le check KYC de l'API
      createdAt: new Date(),
    });
    console.log(`[OK] Profil Firestore Chauffeur créé.`);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      const user = await auth.getUserByEmail(chauffeurEmail);
      chauffeurUid = user.uid;
      console.log(`[INFO] Chauffeur Test existe déjà (UID: ${chauffeurUid}).`);
    } else {
      console.error(`[ERREUR] Chauffeur Test:`, error);
    }
  }

  console.log("\n===============================================");
  console.log("RÉSUMÉ DES COMPTES DE TEST (STAGING/DEV)");
  console.log("===============================================");
  console.log("VOYAGEUR :");
  console.log(`  Email : ${voyageurEmail}`);
  console.log(`  Mot de passe : ${voyageurPassword}`);
  console.log("CHAUFFEUR :");
  console.log(`  Email : ${chauffeurEmail}`);
  console.log(`  Mot de passe : ${chauffeurPassword}`);
  console.log("===============================================\n");
  
  process.exit(0);
}

createTestAccounts();
