"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useFavoritesStore from "../../store/favoritesStore";

export default function FavorisPage() {
  const [mounted, setMounted] = useState(false);
  const favoriteItems = useFavoritesStore((state) => state.items);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Mes Favoris</h1>
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-black/5 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-foreground/20 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <p className="text-foreground/50 mb-6 text-lg">Vous n'avez encore aucun parfum favori.</p>
          <Link href="/boutique" className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-sm">
            Découvrir nos parfums
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {favoriteItems.map((produit) => (
            <div key={produit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-md transition-all relative">
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeFavorite(produit.id);
                }}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform shadow-sm"
                aria-label="Retirer des favoris"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </button>

              <Link href={`/produit/${produit.slug}`} className="flex flex-col h-full">
                {!produit.isAvailable && (
                  <div className="absolute inset-0 bg-white/60 z-10 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-black text-white px-3 py-1 font-bold text-sm rounded">Indisponible</span>
                  </div>
                )}

                <div className="aspect-[4/5] bg-background rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                  {produit.isNew && (
                    <span className="absolute top-2 left-2 bg-accent text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-20">Nouveau</span>
                  )}
                  {produit.isOnSale && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-20">Promo</span>
                  )}
                  
                  {produit.images && produit.images.length > 0 ? (
                    <Image src={produit.images[0]} alt={produit.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                  ) : (
                    <div className="w-1/2 h-2/3 bg-foreground/5 rounded-md flex items-center justify-center text-xs text-black/20 text-center">Image</div>
                  )}
                </div>
                <div className="mt-auto">
                  <h3 className="font-semibold text-foreground text-sm md:text-base group-hover:text-primary transition-colors line-clamp-1">{produit.name}</h3>
                  <p className="text-xs text-foreground/60 mb-2">{produit.brand}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {produit.price > 0 ? (
                        <>
                          <p className={`font-bold text-sm md:text-base ${produit.isOnSale ? 'text-red-500' : 'text-primary'}`}>
                            {produit.price.toLocaleString('fr-FR')} FCFA
                          </p>
                          {produit.isOnSale && produit.oldPrice && (
                            <p className="text-[10px] text-foreground/40 line-through">
                              {produit.oldPrice.toLocaleString('fr-FR')} FCFA
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs italic text-foreground/50">Prix sur demande</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
