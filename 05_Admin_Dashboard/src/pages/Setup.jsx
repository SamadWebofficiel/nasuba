import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions, db } from '../config/firebase';
import useAuthStore from '../store/useAuthStore';
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';

const Setup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  console.log("NASUBA CACHE BUST v2");
  const { user, adminData } = useAuthStore();

  useEffect(() => {
    // Si déjà connecté et OWNER, rediriger vers le dashboard
    if (user && adminData?.role === 'OWNER') {
      navigate('/');
    }
  }, [user, adminData, navigate]);

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);

    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }
      
      // On utilise getDocs avec le `db` importé statiquement en haut du fichier
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('role', '==', 'OWNER'));
      const querySnapshot = await getDocs(q);
      
      // if (!querySnapshot.empty && !querySnapshot.docs.find(d => d.id === userCredential.user.uid)) {
      //   throw new Error('Un compte OWNER existe déjà. La configuration est verrouillée.');
      // }

      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        email: email,
        role: 'OWNER',
        name: 'Fondateur NASUBA',
        createdAt: serverTimestamp(),
        permissions: ['ALL']
      });

      setSuccess('Compte OWNER créé avec succès ! Redirection...');
      // Le store (onAuthStateChanged) détectera le login et chargera les données admin
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('déjà')) {
        setError('Un compte OWNER existe déjà. La configuration est verrouillée.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Cet email existe déjà, mais le mot de passe est incorrect.');
      } else {
        setError("Erreur lors de la création du compte. Détail : " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Configuration Initiale</h2>
          <p className="text-slate-500">Création du compte OWNER NASUBA</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 border border-green-100">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSetup}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe sécurisé
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte OWNER'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
