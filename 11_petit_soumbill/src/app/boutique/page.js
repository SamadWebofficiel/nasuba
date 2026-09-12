"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getProducts } from "../../lib/productService";
import useFavoritesStore from "../../store/favoritesStore";

export default function Boutique() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Filtres
  const [filter, setFilter] = useState("Tout voir");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Plus récent");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Favoris
  const favoriteItems = useFavoritesStore((state) => state.items);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  useEffect(() => {
    setMounted(true);
    async function fetchProducts() {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  if (!mounted) return null;

  // Filtrage
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.brand.toLowerCase().includes(search.toLowerCase()) ||
                          product.category.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (onlyAvailable && !product.isAvailable) return false;

    if (filter === "Tout voir") return true;
    if (filter === "Homme" || filter === "Femme" || filter === "Unisexe") {
      return product.category === filter;
    }
    if (filter === "Nouveautés") return product.isNew;
    if (filter === "Promotions") return product.isOnSale;
    
    return true;
  });

  // Tri
  filteredProducts = filteredProducts.sort((a, b) => {
    if (sort === "Prix croissant") return a.price - b.price;
    if (sort === "Prix décroissant") return b.price - a.price;
    if (sort === "Plus populaire") {
      // Simulation pour "Populaire" : on favorise ceux en promo ou stock faible
      return (b.isOnSale ? 1 : 0) - (a.isOnSale ? 1 : 0);
    }
    // Plus récent (par défaut, on peut utiliser l'ID ou une date)
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Notre Catalogue</h1>
      
      {/* Filtres & Recherche */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            {["Tout voir", "Homme", "Femme", "Unisexe", "Nouveautés", "Promotions"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f 
                    ? 'bg-foreground text-background' 
                    : 'bg-white border border-black/10 text-foreground hover:bg-black/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Rechercher (nom, marque, catégorie)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-4 top-3 text-black/40">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
        
        {/* Tris et Disponibilité */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/80">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="accent-primary w-4 h-4 rounded border-gray-300"
            />
            En stock uniquement
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort" className="font-medium">Trier par :</label>
            <select 
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-black/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="Plus récent">Plus récent</option>
              <option value="Plus populaire">Plus populaire</option>
              <option value="Prix croissant">Prix croissant</option>
              <option value="Prix décroissant">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille de produits */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-black/5 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-foreground/20 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-foreground/50 mb-6 text-lg">Aucun parfum trouvé.</p>
          <button 
            onClick={() => { setSearch(""); setFilter("Tout voir"); setOnlyAvailable(false); }}
            className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-sm"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((produit) => (
            <div key={produit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-md transition-all relative">
              
              {/* Bouton Favoris */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(produit);
                }}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform shadow-sm"
                aria-label={isFavorite(produit.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {isFavorite(produit.id) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
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
                  
                  {produit.stock > 0 && produit.stock <= 5 && produit.isAvailable && (
                    <p className="text-[10px] text-orange-500 font-bold mb-1">Plus que {produit.stock} disponible{produit.stock > 1 ? 's' : ''}</p>
                  )}

                  <div className="flex items-center justify-between mt-1">
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
