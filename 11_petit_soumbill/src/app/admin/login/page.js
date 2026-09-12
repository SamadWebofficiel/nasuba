"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSession } from "../../actions/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Erreur système. Veuillez réessayer plus tard.");
      return;
    }

    if (lockedUntil && new Date() < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - new Date()) / 1000);
      setError(`Trop de tentatives. Veuillez réessayer dans ${remainingSeconds} secondes.`);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // On crée immédiatement le cookie de session pour que le middleware nous laisse passer
      await createSession(userCredential.user.uid);
      setAttempts(0);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const lockTime = new Date(new Date().getTime() + 30 * 1000); // 30 secondes
        setLockedUntil(lockTime);
        setError("Trop de tentatives. Veuillez réessayer dans 30 secondes.");
      } else {
        setError(`Erreur (${err.code}): Identifiants incorrects ou problème technique.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Link href="/" className="mb-8 font-bold text-2xl text-primary flex items-center gap-2">
        Petit Soumbill
      </Link>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-black/5">
        <h1 className="text-2xl font-bold text-center mb-2 text-foreground">Espace Administrateur</h1>
        <p className="text-center text-foreground/60 mb-8">Veuillez vous connecter pour continuer</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="admin@petitsoumbill.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Mot de passe</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || (lockedUntil && new Date() < lockedUntil)}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors mt-4 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-sm text-foreground/40 text-center max-w-sm">
        Cet espace est strictement réservé à la direction de Petit Soumbill Parfumerie.
      </p>
    </div>
  );
}
