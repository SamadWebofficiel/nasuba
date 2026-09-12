"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getPublishedContents } from "../lib/contentService";
import { getProducts } from "../lib/productService";

// Composant de diaporama vidéo automatique (Basé sur les contenus VIDEO)
function PromoVideo({ videoContents, products }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videoContents || videoContents.length === 0) return null;

  const currentContent = videoContents[currentIndex];
  const linkedProduct = currentContent.productId ? products.find(p => p.id === currentContent.productId) : null;

  return (
    <div className="relative w-full max-w-sm md:max-w-md mx-auto aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-foreground/10 flex flex-col">
      <video
        key={currentContent.videoUrl} 
        src={currentContent.videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20 flex flex-col justify-end p-6 text-left">
        <h3 className="text-white text-2xl font-bold mb-1">{currentContent.title}</h3>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{currentContent.shortDescription}</p>
        
        <div className="flex gap-2">
          {linkedProduct && (
            <Link 
              href={`/produit/${linkedProduct.slug}`}
              className="flex-1 bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Voir le parfum
            </Link>
          )}
          <Link 
            href={`/actualites/${currentContent.slug}`}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-center py-2.5 rounded-xl font-semibold transition-colors text-sm"
          >
            Lire plus
          </Link>
        </div>
      </div>

      {videoContents.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 px-2 flex justify-between z-30">
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + videoContents.length) % videoContents.length)}
            className="w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            &lt;
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % videoContents.length)}
            className="w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

// Composant Carte Contenu (Pour Nouveautés, Promos, News)
function ContentCard({ content, products, typeLabel, badgeColor }) {
  const linkedProduct = content.productId ? products.find(p => p.id === content.productId) : null;
  const imageToUse = content.imageUrl || (linkedProduct?.images?.[0]) || null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-md transition-all relative">
      <Link href={`/actualites/${content.slug}`} className="flex flex-col h-full">
        
        <div className="aspect-[4/5] bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative border border-black/5">
          {typeLabel && (
            <span className={`absolute top-2 left-2 text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-20 ${badgeColor || 'bg-black'}`}>
              {typeLabel}
            </span>
          )}
          
          {imageToUse ? (
            <Image src={imageToUse} alt={content.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="text-xs text-black/20">Sans image</div>
          )}
        </div>
        
        <h4 className="font-bold text-foreground text-base md:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {content.title}
        </h4>
        <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
          {content.shortDescription}
        </p>

        <div className="mt-auto pt-4 border-t border-black/5">
          {linkedProduct && linkedProduct.isAvailable !== false ? (
             <div className="flex flex-col">
               <span className="text-xs text-foreground/50 uppercase tracking-wide mb-1">Produit associé :</span>
               <div className="flex justify-between items-center">
                 <span className="font-semibold text-sm line-clamp-1 flex-1">{linkedProduct.name}</span>
                 <span className={`font-bold text-sm ${linkedProduct.isOnSale ? 'text-red-500' : 'text-primary'}`}>
                   {linkedProduct.price.toLocaleString('fr-FR')} FCFA
                 </span>
               </div>
             </div>
          ) : (
             <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
               Lire l'article &rarr;
             </span>
          )}
        </div>
      </Link>
    </div>
  );
}

// Carte Produit Classique (Pour la section "Populaires" qui reste liée aux produits)
function ProductCard({ produit }) {
  return (
    <Link href={`/produit/${produit.slug}`} className="bg-white rounded-xl p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-md transition-all relative">
      {!produit.isAvailable && (
        <div className="absolute inset-0 bg-white/60 z-30 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-black text-white px-3 py-1 font-bold text-sm rounded">Indisponible</span>
        </div>
      )}
      <div className="aspect-[4/5] bg-background rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
        {produit.images && produit.images.length > 0 ? (
          <Image src={produit.images[0]} alt={produit.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        ) : (
          <div className="w-1/2 h-2/3 bg-foreground/5 rounded-md flex items-center justify-center text-xs text-black/20">Image</div>
        )}
      </div>
      <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">{produit.name}</h4>
      <p className="text-xs text-foreground/60 mb-2">{produit.brand}</p>
      <div className="mt-auto">
        {produit.price > 0 ? (
          <div className="flex flex-col">
            <span className="font-bold text-primary text-sm md:text-base">{produit.price.toLocaleString('fr-FR')} FCFA</span>
          </div>
        ) : (
          <p className="text-sm italic text-foreground/50">Prix sur demande</p>
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [productsList, setProductsList] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  // Sections Contenus
  const [newArrivals, setNewArrivals] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        // 1. Fetch products (used for Popular section and price linking)
        const allProducts = await getProducts();
        setProductsList(allProducts);
        
        // Simulation: 4 parfums au hasard pour les "Populaires" (car on a gardé cette section produit)
        const popProds = [...allProducts].filter(p => p.isAvailable).sort(() => 0.5 - Math.random()).slice(0, 4);
        setPopularProducts(popProds);

        // 2. Fetch Contents
        const allContents = await getPublishedContents();
        
        setNewArrivals(allContents.filter(c => c.type === "NEW_ARRIVAL").slice(0, 4));
        setPromotions(allContents.filter(c => c.type === "PROMOTION").slice(0, 4));
        setVideos(allContents.filter(c => c.type === "VIDEO").slice(0, 10)); // Max 10 vidéos dans le slider
        setNews(allContents.filter(c => c.type === "NEWS" || c.type === "FEATURED_PRODUCT").slice(0, 4));

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative w-full h-[85vh] md:h-[75vh] flex items-center justify-center overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-foreground opacity-50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            PETIT SOUMBILL PARFUMERIE
          </h1>
          <p className="text-xl md:text-2xl text-primary mb-4 italic font-semibold">
            "Votre parfum, votre signature."
          </p>
          <p className="text-sm md:text-base text-white/80 mb-10 max-w-lg mx-auto leading-relaxed">
            Trouvez l'essence qui vous correspond parmi notre sélection premium de parfums pour hommes, femmes et unisexes, en plein cœur de Parakou.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/boutique" 
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-4 px-10 rounded-full transition-colors text-center shadow-lg shadow-primary/30"
            >
              Découvrir les parfums
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Catégories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Catégories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Hommes', 'Femmes', 'Unisexes'].map((cat) => (
            <Link key={cat} href={`/boutique`} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden bg-white shadow-sm border border-black/5 flex items-center justify-center hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
              <h3 className="relative z-10 text-2xl md:text-3xl font-bold text-foreground group-hover:scale-110 transition-transform">{cat}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Chargement global pour les grilles */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* 3. Nouveautés (Basé sur les Contenus NEW_ARRIVAL) */}
          {newArrivals.length > 0 && (
            <section className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Nouveautés</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.map((c) => (
                  <ContentCard key={c.id} content={c} products={productsList} typeLabel="Nouveauté" badgeColor="bg-accent" />
                ))}
              </div>
            </section>
          )}

          {/* 4. Populaires (Reste basé sur les produits) */}
          {popularProducts.length > 0 && (
            <section className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Parfums Populaires</h2>
                <Link href="/boutique" className="text-primary font-medium hover:underline">Voir le catalogue</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {popularProducts.map((p) => <ProductCard key={p.id} produit={p} />)}
              </div>
            </section>
          )}

          {/* 5. Vidéos (Basé sur les contenus VIDEO) */}
          {videos.length > 0 && (
            <section className="container mx-auto px-4">
              <div className="bg-foreground text-background rounded-[3rem] p-8 md:p-16 text-center overflow-hidden relative shadow-2xl border border-black/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold mb-10">Découvrez nos parfums</h2>
                  <PromoVideo videoContents={videos} products={productsList} />
                </div>
              </div>
            </section>
          )}

          {/* 6. Promotions (Basé sur les Contenus PROMOTION) */}
          {promotions.length > 0 && (
            <section className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Promotions en cours</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {promotions.map((c) => (
                  <ContentCard key={c.id} content={c} products={productsList} typeLabel="Promo" badgeColor="bg-red-500" />
                ))}
              </div>
            </section>
          )}

          {/* 7. Actualités de la boutique (NEWS) */}
          {news.length > 0 && (
            <section className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">L'Actualité de la Boutique</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {news.map((c) => (
                  <ContentCard key={c.id} content={c} products={productsList} typeLabel="Actualité" badgeColor="bg-blue-500" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* 8. Pourquoi choisir Petit Soumbill */}
      <section className="bg-background py-16 border-y border-black/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-black/5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Large choix de parfums</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">Nous proposons une sélection minutieuse des meilleures fragrances, régulièrement mise à jour.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-black/5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Commande sur WhatsApp</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">Une expérience d'achat simplifiée : validez votre panier et nous finalisons la commande en direct sur WhatsApp.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-black/5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Boutique à Parakou</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">Venez découvrir nos senteurs directement dans notre point de vente physique à Parakou.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-black/5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Livraison / Retrait</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">Nous organisons la livraison selon vos besoins ou le retrait direct en boutique selon la disponibilité.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Localisation / WhatsApp */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-foreground text-background rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Besoin d'un conseil ?</h2>
            <p className="text-white/80 text-lg">Nous sommes disponibles sur WhatsApp pour vous orienter vers le parfum idéal.</p>
          </div>
          <a 
            href="https://wa.me/22900000000" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-8 rounded-full transition-colors flex items-center gap-3 shadow-lg hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
            </svg>
            Discuter sur WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
