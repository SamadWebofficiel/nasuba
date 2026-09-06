const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');

// Pour utiliser ce script, vous devez avoir le fichier serviceAccountKey.json
// généré depuis la console Firebase (Paramètres du projet > Comptes de service > Générer une nouvelle clé privée)
const serviceAccountPath = './serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error("ERREUR : Le fichier serviceAccountKey.json est introuvable.");
  console.error("Veuillez le télécharger depuis la console Firebase et le placer dans ce dossier.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== CONFIGURATION DU PREMIER ADMINISTRATEUR (OWNER) ===");
console.log("Attention: L'utilisateur Firebase Auth doit déjà exister (inscrivez-vous via l'interface Admin d'abord, ou donnez l'UID d'un compte existant).\\n");

rl.question('Entrez le User ID (UID Firebase) de l\\'administrateur : ', async (uid) => {
  if (!uid || uid.trim() === '') {
    console.error("L'UID est requis.");
    process.exit(1);
  }

  rl.question('Entrez l\\'adresse e-mail de l\\'administrateur : ', async (email) => {
    rl.question('Entrez le nom de l\\'administrateur : ', async (name) => {
      try {
        console.log(`\\nCréation du profil OWNER pour ${email} (UID: ${uid})...`);
        
        await db.collection('admins').doc(uid).set({
          email: email,
          name: name,
          role: 'OWNER',
          permissions: [], // OWNER bypasses permissions, but we can set it empty
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'Actif'
        });

        console.log("SUCCÈS : Le profil administrateur OWNER a été créé avec succès.");
        console.log("Vous pouvez maintenant vous connecter au panneau d'administration NASUBA ADMIN avec ce compte.");
      } catch (error) {
        console.error("ERREUR lors de la création :", error);
      } finally {
        process.exit(0);
      }
    });
  });
});
