"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useCartStore from "../../store/cartStore";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, doc, runTransaction } from "firebase/firestore";

export default function Checkout() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    ville: "Parakou",
    quartier: "",
    modeReception: "Livraison",
    message: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl mb-4">Votre panier est vide.</p>
        <Link href="/boutique" className="bg-primary text-white px-6 py-2 rounded-full font-semibold">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    else if (formData.nom.trim().length < 2) newErrors.nom = "Le nom est trop court";
    else if (formData.nom.length > 50) newErrors.nom = "Le nom est trop long";

    if (!formData.telephone.trim()) newErrors.telephone = "Le numéro de téléphone est obligatoire";
    else if (!/^\+?[0-9\s-]{8,20}$/.test(formData.telephone.trim())) newErrors.telephone = "Format de numéro invalide";

    if (!formData.ville.trim()) newErrors.ville = "La ville est obligatoire";
    if (formData.modeReception === "Livraison" && !formData.quartier.trim()) {
      newErrors.quartier = "Le quartier est obligatoire pour la livraison";
    }

    if (formData.message && formData.message.length > 500) {
      newErrors.message = "Le message est trop long (500 caractères max)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!db) throw new Error("Firebase non initialisé");

      let generatedOrderNumber = "";

      // 1. Transaction Firestore pour sécuriser le stock et le numéro de commande
      await runTransaction(db, async (transaction) => {
        // Préparer les références
        const counterRef = doc(db, "counters", "orders");
        const productRefs = cartItems.map(item => ({ ref: doc(db, "products", item.id), item }));
        
        // Lectures (doivent être faites avant les écritures)
        const counterDoc = await transaction.get(counterRef);
        let nextOrderNum = 1;
        if (counterDoc.exists()) {
          nextOrderNum = (counterDoc.data().count || 0) + 1;
        }

        const productsData = [];
        for (const p of productRefs) {
          const pDoc = await transaction.get(p.ref);
          if (!pDoc.exists()) {
            throw new Error(`Le produit "${p.item.nom}" n'existe plus.`);
          }
          const data = pDoc.data();
          if (data.stock < p.item.quantite) {
            throw new Error(`Stock insuffisant pour le produit "${data.name}". Il n'en reste que ${data.stock}.`);
          }
          productsData.push({ ref: p.ref, newStock: data.stock - p.item.quantite });
        }

        // Écritures
        // 1. Décrémenter les stocks
        for (const p of productsData) {
          transaction.update(p.ref, { stock: p.newStock, updatedAt: new Date() });
        }

        // 2. Mettre à jour le compteur
        const paddedNum = nextOrderNum.toString().padStart(4, "0");
        const year = new Date().getFullYear();
        generatedOrderNumber = `PSP-${year}-${paddedNum}`;
        transaction.set(counterRef, { count: nextOrderNum }, { merge: true });

        // 3. Créer la commande
        const newOrderRef = doc(collection(db, "orders"));
        const orderData = {
          orderNumber: generatedOrderNumber,
          customerName: formData.nom.trim().substring(0, 50),
          customerPhone: formData.telephone.trim().substring(0, 20),
          city: formData.ville.trim().substring(0, 100),
          neighborhood: formData.quartier.trim().substring(0, 100),
          deliveryMethod: formData.modeReception,
          customerMessage: formData.message.trim().substring(0, 500),
          products: cartItems.map(item => ({
            productId: item.id,
            productName: item.nom,
            price: item.prix,
            quantity: item.quantite,
            image: item.image || "",
            subtotal: item.prix * item.quantite
          })),
          subtotal: subtotal,
          deliveryFee: 0,
          total: subtotal + 0,
          status: "Nouvelle",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        transaction.set(newOrderRef, orderData);
      });

      // 2. Construire le message WhatsApp
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "22900000000";
      
      let text = `Bonjour Petit Soumbill Parfumerie,\n\nJe souhaite passer une commande (Réf: *${generatedOrderNumber}*).\n\nProduits :\n`;
      
      cartItems.forEach(item => {
        text += `- ${item.nom} — ${item.quantite} × ${item.prix.toLocaleString('fr-FR')} FCFA = ${(item.quantite * item.prix).toLocaleString('fr-FR')} FCFA\n`;
      });

      text += `\nTotal commande : *${subtotal.toLocaleString('fr-FR')} FCFA*\n\n`;
      text += `Client :\n`;
      text += `Nom : ${formData.nom}\n`;
      text += `Téléphone : ${formData.telephone}\n`;
      text += `Ville : ${formData.ville}\n`;
      if (formData.quartier) {
        text += `Quartier : ${formData.quartier}\n`;
      }
      text += `\nMode de réception :\n${formData.modeReception}\n`;

      if (formData.message.trim()) {
        text += `\nMessage :\n${formData.message}\n`;
      }
      
      text += `\nMerci.`;

      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

      // Vider le panier
      clearCart();

      // Ouvrir WhatsApp
      window.open(whatsappUrl, "_blank");
      
      // Rediriger vers l'accueil ou page de succès
      router.push("/");
      
    } catch (error) {
      console.error("Erreur lors de la commande", error);
      alert(error.message || "Une erreur est survenue lors de l'enregistrement de votre commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Validation de la commande</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulaire */}
        <div>
          <h2 className="text-xl font-bold mb-6">Vos informations</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium mb-1">Nom complet *</label>
              <input 
                type="text" 
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border ${errors.nom ? 'border-red-500' : 'border-black/10'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                placeholder="Votre nom"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Numéro de téléphone *</label>
              <input 
                type="tel" 
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border ${errors.telephone ? 'border-red-500' : 'border-black/10'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                placeholder="Ex: +229..."
              />
              {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ville *</label>
                <input 
                  type="text" 
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border ${errors.ville ? 'border-red-500' : 'border-black/10'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quartier {formData.modeReception === "Livraison" && "*"}</label>
                <input 
                  type="text" 
                  name="quartier"
                  value={formData.quartier}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border ${errors.quartier ? 'border-red-500' : 'border-black/10'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  placeholder="Votre quartier"
                />
                {errors.quartier && <p className="text-red-500 text-xs mt-1">{errors.quartier}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode de réception *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="modeReception" 
                    value="Livraison"
                    checked={formData.modeReception === "Livraison"}
                    onChange={handleChange}
                    className="accent-primary w-4 h-4"
                  />
                  <span>Livraison</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="modeReception" 
                    value="Retrait en boutique"
                    checked={formData.modeReception === "Retrait en boutique"}
                    onChange={handleChange}
                    className="accent-primary w-4 h-4"
                  />
                  <span>Retrait en boutique</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message ou précision (facultatif)</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Une note pour la boutique..."
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 mt-6 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Commander sur WhatsApp
                </>
              )}
            </button>

          </form>
        </div>

        {/* Récapitulatif */}
        <div>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">Récapitulatif de la commande</h2>
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-black/5 pb-2">
                  <div>
                    <p className="font-semibold">{item.nom}</p>
                    <p className="text-foreground/60">{item.quantite} x {item.prix.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="font-bold">
                    {(item.quantite * item.prix).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-black/10 pt-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-foreground/70">Sous-total</span>
                <span className="font-semibold">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-foreground/70">Frais de livraison</span>
                <span className="font-semibold text-primary">À confirmer</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-bold text-accent">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
