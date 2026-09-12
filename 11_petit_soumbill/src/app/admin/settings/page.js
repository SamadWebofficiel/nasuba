"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    shopName: "Petit Soumbill Parfumerie",
    description: "Votre parfum, votre signature.",
    whatsappNumber: "22900000000",
    phone: "",
    address: "",
    city: "Parakou",
    country: "Bénin",
    hours: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    googleMapsLink: "",
    deliveryZones: "",
    deliveryFees: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchSettings() {
      try {
        if (!db) return;
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error("Erreur chargement paramètres", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      if (!db) throw new Error("Firebase non connecté");
      await setDoc(doc(db, "settings", "global"), settings);
      setMessage({ type: "success", text: "Paramètres sauvegardés avec succès !" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde des paramètres." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Paramètres de la boutique</h1>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-black/5 shadow-sm space-y-8">
        
        {/* Informations Générales */}
        <div>
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2 mb-4">Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la boutique</label>
              <input type="text" name="shopName" value={settings.shopName} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description courte (Slogan)</label>
              <input type="text" name="description" value={settings.description} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2 mb-4">Contacts & WhatsApp</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Numéro WhatsApp (Réception des commandes) *</label>
              <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} required placeholder="Ex: 22900000000" className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
              <p className="text-xs text-foreground/50 mt-1">Format international sans le "+" (ex: 229XXXXXXXX)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Numéro de téléphone classique</label>
              <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div>
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2 mb-4">Localisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse physique (si disponible)</label>
              <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <input type="text" name="city" value={settings.city} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pays</label>
              <input type="text" name="country" value={settings.country} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Heures & Réseaux */}
        <div>
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2 mb-4">Horaires & Réseaux Sociaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Horaires d'ouverture</label>
              <input type="text" name="hours" value={settings.hours} onChange={handleChange} placeholder="Ex: Lundi-Samedi: 08h - 20h" className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien Facebook</label>
              <input type="url" name="facebook" value={settings.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien Instagram</label>
              <input type="url" name="instagram" value={settings.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien TikTok</label>
              <input type="url" name="tiktok" value={settings.tiktok || ""} onChange={handleChange} placeholder="https://tiktok.com/@..." className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien de la carte Google Maps (URL iframe ou lien public)</label>
              <input type="url" name="googleMapsLink" value={settings.googleMapsLink || ""} onChange={handleChange} placeholder="https://maps.google.com/..." className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Livraison */}
        <div>
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2 mb-4">Informations de Livraison</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zones desservies & Conditions de retrait</label>
              <textarea name="deliveryZones" value={settings.deliveryZones || ""} onChange={handleChange} placeholder="Ex: Livraison disponible à Parakou et Cotonou. Retrait gratuit en boutique." className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" rows="3"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frais de livraison (Indicatif)</label>
              <textarea name="deliveryFees" value={settings.deliveryFees || ""} onChange={handleChange} placeholder="Ex: 1000 FCFA dans Parakou, 2500 FCFA hors Parakou." className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" rows="2"></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-black/5">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Sauvegarder les paramètres"}
          </button>
        </div>

      </form>
    </div>
  );
}
