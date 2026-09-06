require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { initializeApp, cert } = require("firebase-admin/app");

// Initialisation de Firebase Admin
// Note: En STAGING/PROD sur Render, nous utiliserons la variable d'environnement GOOGLE_APPLICATION_CREDENTIALS 
// qui pointera vers le fichier JSON du Service Account Firebase (ou via les clés privées injectées).
// En local, si aucune clé n'est fournie, ça tentera d'utiliser le credential par défaut.
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  // Mode dev local par défaut si connecté via gcloud ou si on émule
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Token manquant.' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: 'unauthenticated', message: 'Token invalide ou expiré.' });
  }
};

// Route de test
app.get('/', (req, res) => {
  res.send('API NASUBA en ligne.');
});

// Helper pour récupérer un utilisateur
async function getUser(uid) {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// ==========================================
// ROUTES VOYAGEUR
// ==========================================

// Demander une course
app.post('/api/rides/request', authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { origin, destination, serviceType, pricing } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: "invalid-argument", message: "Origine et destination requises." });
    }

    const userProfile = await getUser(uid);

    const rideData = {
      status: 'PENDING',
      traveler: {
        id: uid,
        phone: req.user.phone_number || userProfile?.phone || 'Inconnu',
        name: userProfile?.name || 'Inconnu'
      },
      serviceType: serviceType || 'TAXI',
      route: {
        origin: origin,
        destination: destination
      },
      pricing: {
        estimatedAmount: pricing?.estimatedAmount || 0,
        currency: 'XOF',
        paymentMethod: pricing?.paymentMethod || 'CASH'
      },
      timestamps: {
        requestedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }
    };

    const docRef = await db.collection("rides").add(rideData);
    
    return res.status(201).json({
      success: true,
      rideId: docRef.id,
      message: "Course demandée avec succès."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal", message: error.message });
  }
});

// ==========================================
// ROUTES CHAUFFEUR
// ==========================================

// Accepter une course
app.post('/api/rides/accept', authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { rideId, counterOffer } = req.body;

    if (!rideId) {
      return res.status(400).json({ error: "invalid-argument", message: "ID de course manquant." });
    }

    const rideRef = db.collection("rides").doc(rideId);
    
    await db.runTransaction(async (transaction) => {
      const rideDoc = await transaction.get(rideRef);
      if (!rideDoc.exists) {
        throw new Error("not-found");
      }
      
      const ride = rideDoc.data();
      
      if (ride.status !== 'PENDING' && ride.status !== 'SEARCHING') {
        throw new Error("failed-precondition");
      }

      const driverDoc = await transaction.get(db.collection("drivers").doc(uid));
      const driver = driverDoc.exists ? driverDoc.data() : { firstName: 'Chauffeur', phone: 'Inconnu' };

      // Vérification KYC : on doit s'assurer que le compte est Validé (ou démo locale)
      // Pour l'instant en dev on laisse passer, mais en prod il faudra bloquer.
      const isDev = process.env.NODE_ENV === 'development';
      if (!isDev && driver.validationStatus !== 'Validé' && driver.validationStatus !== 'approved') {
        throw new Error("permission-denied");
      }

      const updates = {
        status: 'ACCEPTED',
        driver: {
          id: uid,
          name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
          phone: driver.phone || 'Inconnu',
          vehiclePlate: driver.vehiclePlate || 'Inconnu'
        },
        'timestamps.acceptedAt': FieldValue.serverTimestamp(),
        'timestamps.updatedAt': FieldValue.serverTimestamp()
      };

      if (counterOffer) {
        updates['pricing.driverCounterOffer'] = counterOffer;
      }

      transaction.update(rideRef, updates);
    });

    return res.json({ success: true, message: "Course acceptée avec succès." });

  } catch (error) {
    console.error(error);
    if (error.message === 'not-found') return res.status(404).json({ error: "not-found", message: "Course introuvable." });
    if (error.message === 'failed-precondition') return res.status(400).json({ error: "failed-precondition", message: "Course déjà prise." });
    if (error.message === 'permission-denied') return res.status(403).json({ error: "permission-denied", message: "Compte non validé." });
    
    return res.status(500).json({ error: "internal", message: error.message });
  }
});

// Changer l'état d'une course (STARTED, COMPLETED, CANCELLED)
app.post('/api/rides/update_state', authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { rideId, newState } = req.body;
    const allowedStates = ['DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'COMPLETED', 'CANCELLED_BY_TRAVELER', 'CANCELLED_BY_DRIVER'];
    
    if (!allowedStates.includes(newState)) {
      return res.status(400).json({ error: "invalid-argument", message: "État invalide." });
    }

    const rideRef = db.collection("rides").doc(rideId);
    
    await db.runTransaction(async (transaction) => {
      const rideDoc = await transaction.get(rideRef);
      if (!rideDoc.exists) {
        throw new Error("not-found");
      }
      
      const ride = rideDoc.data();

      if (['DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'COMPLETED', 'CANCELLED_BY_DRIVER'].includes(newState)) {
        if (ride.driver?.id !== uid) {
          throw new Error("permission-denied");
        }
      }

      if (newState === 'CANCELLED_BY_TRAVELER') {
        if (ride.traveler?.id !== uid) {
          throw new Error("permission-denied");
        }
      }

      transaction.update(rideRef, {
        status: newState,
        [`timestamps.${newState.toLowerCase()}At`]: FieldValue.serverTimestamp(),
        'timestamps.updatedAt': FieldValue.serverTimestamp()
      });
    });

    return res.json({ success: true, message: `Course passée à l'état ${newState}` });
  } catch (error) {
    console.error(error);
    if (error.message === 'not-found') return res.status(404).json({ error: "not-found", message: "Course introuvable." });
    if (error.message === 'permission-denied') return res.status(403).json({ error: "permission-denied", message: "Non autorisé." });
    
    return res.status(500).json({ error: "internal", message: error.message });
  }
});

// ==========================================
// ROUTES ADMIN
// ==========================================

// Setup OWNER
app.post('/api/admin/setup', authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { email } = req.body;
    
    const adminsRef = db.collection('admins');
    const ownerQuery = await adminsRef.where('role', '==', 'OWNER').limit(1).get();
    
    if (!ownerQuery.empty) {
      return res.status(403).json({ error: "permission-denied", message: "Un compte OWNER existe déjà." });
    }

    await adminsRef.doc(uid).set({
      email: email,
      role: 'OWNER',
      name: 'Fondateur NASUBA',
      createdAt: FieldValue.serverTimestamp(),
      permissions: ['ALL']
    });

    return res.json({ success: true, message: "Le compte OWNER a été créé." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "internal", message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend NASUBA démarré sur le port ${PORT}`);
});
