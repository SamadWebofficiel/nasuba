"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useCartStore from "../../store/cartStore";

export default function Panier() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  // Frais de livraison : à confirmer
  const deliveryText = "À confirmer";

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Votre Panier</h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm items-center">
                <div className="w-20 h-20 bg-background rounded-xl border border-black/5 flex-shrink-0"></div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-foreground line-clamp-1">{item.nom}</h3>
                  <p className="text-sm text-foreground/60 mb-2">{item.marque} • {item.contenance}</p>
                  <p className="font-bold text-primary">{item.prix.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                  <div className="flex items-center gap-3 bg-background rounded-full px-3 py-1 border border-black/10">
                    <button 
                      onClick={() => decrementQuantity(item.id)}
                      className="text-foreground/50 hover:text-foreground font-bold px-2 py-1"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">{item.quantite}</span>
                    <button 
                      onClick={() => incrementQuantity(item.id)}
                      className="text-foreground/50 hover:text-foreground font-bold px-2 py-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de la commande */}
          <div className="bg-foreground text-background p-6 md:p-8 rounded-3xl h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
            
            <div className="space-y-4 text-sm opacity-90 mb-6">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span>{deliveryText}</span>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-4 mb-8 flex justify-between items-end">
              <span className="font-semibold">Total (hors livraison)</span>
              <span className="text-2xl font-bold text-accent">{subtotal.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 text-center mb-3"
            >
              Commander
            </Link>
            
            <Link 
              href="/boutique"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-black/5 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-foreground/20 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <p className="text-foreground/50 mb-6 text-lg">Votre panier est vide.</p>
          <Link href="/boutique" className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-sm">
            Découvrir nos parfums
          </Link>
        </div>
      )}
    </div>
  );
}
