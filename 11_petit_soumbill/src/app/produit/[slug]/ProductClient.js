"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import useCartStore from "../../../store/cartStore";
import useRecentStore from "../../../store/recentStore";
import useUIStore from "../../../store/uiStore";
import { getProducts } from "../../../lib/productService";

export default function ProductClient({ product, shopName }) {
  const addItem = useCartStore((state) => state.addItem);
  const [showToast, setShowToast] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [produit] = useState(product);
  const [similarProducts, setSimilarProducts] = useState([]);
  
  // 'image_0', 'image_1', ..., 'video'
  const [activeMedia, setActiveMedia] = useState("image_0");
  
  const addRecent = useRecentStore((state) => state.addRecent);
  const recentProducts = useRecentStore((state) => state.recentProducts);
  const clearRecent = useRecentStore((state) => state.clearRecent);
  const setWhatsappMessage = useUIStore((state) => state.setWhatsappMessage);

  useEffect(() => {
    if (produit) {
      // 1. Ajouter aux récents
      addRecent(produit);

      // 2. Mettre à jour le message WhatsApp flottant contextuel
      const isOutOfStock = !produit.isAvailable || produit.stock <= 0;
      if (isOutOfStock) {
        setWhatsappMessage(`Bonjour, je souhaite savoir quand ${produit.name} sera disponible.`);
      } else {
        setWhatsappMessage(`Bonjour, je souhaite avoir des informations sur ${produit.name}.`);
      }
    }
  }, [produit, addRecent, setWhatsappMessage]);

  useEffect(() => {
    async function loadSimilar() {
      try {
        const all = await getProducts();
        // Filtrer par même catégorie, en excluant le produit actuel
        let similar = all.filter(p => p.id !== produit?.id && p.category === produit?.category);
        
        // S'il n'y en a pas assez, on complète avec la même marque ou n'importe quoi d'autre
        if (similar.length < 4) {
          const others = all.filter(p => p.id !== produit?.id && !similar.find(s => s.id === p.id));
          similar = [...similar, ...others];
        }
        
        setSimilarProducts(similar.slice(0, 4));
      } catch (e) {
        console.error(e);
      }
    }
    if (produit) loadSimilar();
  }, [produit]);

  const handleAddToCart = () => {
    if (!produit || !produit.isAvailable || produit.stock <= 0) return;
    addItem({
      id: produit.id,
      nom: produit.name,
      marque: produit.brand,
      prix: produit.price,
      contenance: produit.volume,
      image: produit.images?.[0] || ""
    });
    setShowToast(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${produit.name} | ${shopName || 'Petit Soumbill Parfumerie'}`,
      text: `Découvrez ${produit.name} chez ${shopName || 'Petit Soumbill Parfumerie'}. Prix : ${produit.price.toLocaleString('fr-FR')} FCFA`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Partage annulé ou échoué", err);
      }
    } else {
      // Fallback WhatsApp
      const message = encodeURIComponent(`${shareData.text}\n\nVoir le produit : ${shareData.url}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const handleAskAvailability = () => {
    const message = encodeURIComponent(`Bonjour Petit Soumbill Parfumerie,\n\nJe souhaite être informé(e) lorsque ce parfum sera disponible :\n\nProduit : ${produit.name}\n\nMerci.`);
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2290197320132";
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  if (!produit) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
        <Link href="/boutique" className="text-primary hover:underline">Retour à la boutique</Link>
      </div>
    );
  }

  const isOutOfStock = !produit.isAvailable || produit.stock <= 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Fil d'ariane */}
        <nav className="text-sm text-foreground/60 mb-8">
          <Link href="/" className="hover:text-primary">Accueil</Link> &gt;{" "}
          <Link href="/boutique" className="hover:text-primary">Boutique</Link> &gt;{" "}
          <span className="text-foreground">{produit.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Colonne Gauche : Images et Vidéo */}
          <div className="space-y-4">
            <div className="aspect-[4/5] md:aspect-square bg-background rounded-3xl overflow-hidden relative flex items-center justify-center border border-black/5">
              {produit.isNew && (
                  <span className="absolute top-4 left-4 bg-accent text-white text-xs uppercase font-bold px-3 py-1.5 rounded z-20">Nouveau</span>
                )}
              {activeMedia === "video" && produit.videoUrl ? (
                <video 
                  src={produit.videoUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : produit.images && produit.images.length > 0 ? (
                <div className="w-full h-full relative cursor-zoom-in" onClick={() => setIsZoomed(true)}>
                  <Image 
                    src={produit.images[parseInt(activeMedia.split('_')[1]) || 0]} 
                    alt={produit.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover" 
                    priority
                  />
                  <div className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-1/2 h-2/3 bg-foreground/5 rounded-xl flex items-center justify-center text-black/30">Image</div>
              )}
            </div>
            
            {/* Galerie miniature dynamique */}
            {(produit.images?.length > 1 || (produit.images?.length === 1 && produit.videoUrl)) && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {produit.images && produit.images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveMedia(`image_${i}`)}
                    className={`w-20 h-20 md:w-24 md:h-24 bg-background rounded-xl flex-shrink-0 border ${activeMedia === `image_${i}` ? 'border-primary border-2' : 'border-black/5'} overflow-hidden cursor-pointer hover:border-primary transition-colors relative`}
                  >
                    <Image src={img} alt={`${produit.name} ${i}`} fill sizes="100px" className="object-cover" />
                  </div>
                ))}
                
                {/* Miniature Vidéo - Uniquement si videoUrl existe */}
                {produit.videoUrl && (
                  <div 
                    onClick={() => setActiveMedia("video")}
                    className={`w-20 h-20 md:w-24 md:h-24 bg-foreground rounded-xl flex-shrink-0 border ${activeMedia === 'video' ? 'border-primary border-2' : 'border-black/5'} flex items-center justify-center cursor-pointer hover:bg-foreground/90 transition-colors relative overflow-hidden`}
                  >
                    {produit.images && produit.images.length > 0 && (
                      <Image src={produit.images[0]} alt="Video poster" fill sizes="100px" className="object-cover opacity-50" />
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white relative z-10">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonne Droite : Infos Produit */}
          <div className="flex flex-col">
            <div className="mb-2 text-primary font-medium tracking-wide uppercase text-sm">
              {produit.brand}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{produit.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex flex-col">
                {produit.price > 0 ? (
                  <>
                    <span className={`text-2xl md:text-3xl font-bold ${produit.isOnSale ? 'text-red-500' : 'text-foreground'}`}>
                      {produit.price.toLocaleString('fr-FR')} FCFA
                    </span>
                    {produit.isOnSale && produit.oldPrice && (
                      <span className="text-sm text-foreground/40 line-through">
                        Ancien prix : {produit.oldPrice.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xl font-medium text-foreground/60 italic">Prix à définir</span>
                )}
              </div>
              
              {isOutOfStock ? (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Rupture de stock</span>
              ) : (
                <span className={`text-xs font-bold px-2 py-1 rounded ${produit.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {produit.stock > 0 && produit.stock <= 5 ? `Plus que ${produit.stock} disponible${produit.stock > 1 ? 's' : ''}` : "En stock"}
                </span>
              )}
            </div>

            <p className="text-foreground/80 mb-8 leading-relaxed whitespace-pre-line">
              {produit.description}
            </p>

            {/* Attributs */}
            <div className="grid grid-cols-2 gap-4 mb-8 bg-background p-4 rounded-xl border border-black/5">
              <div>
                <span className="block text-xs text-foreground/50 uppercase tracking-wider mb-1">Contenance</span>
                <span className="font-semibold text-foreground">{produit.volume}</span>
              </div>
              <div>
                <span className="block text-xs text-foreground/50 uppercase tracking-wider mb-1">Catégorie</span>
                <span className="font-semibold text-foreground">{produit.category}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-auto">
              {isOutOfStock ? (
                <button 
                  onClick={handleAskAvailability}
                  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 border border-orange-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Demander quand ce parfum sera disponible
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="w-full font-semibold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-foreground hover:bg-black text-background hover:scale-[1.02]"
                >
                  Ajouter au panier
                </button>
              )}
              
              <button 
                onClick={handleShare}
                className="w-full bg-white border-2 border-foreground/10 hover:border-foreground/30 text-foreground font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                Partager ce parfum
              </button>
            </div>

            {/* Notes Olfactives */}
            {produit.fragranceNotes && produit.fragranceNotes.length > 0 && (
              <div className="mt-12 pt-8 border-t border-black/5">
                <h3 className="text-lg font-bold text-foreground mb-4">Accords Principaux</h3>
                <div className="flex flex-wrap gap-2">
                  {produit.fragranceNotes.map((note) => (
                    <span key={note} className="bg-background border border-black/10 text-foreground px-4 py-2 rounded-full text-sm font-medium">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        
        {/* Section Vous pourriez aussi aimer */}
        {similarProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-black/5">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center md:text-left">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {similarProducts.map((p) => (
                <Link href={`/produit/${p.slug}`} key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-md transition-all">
                  <div className="aspect-[4/5] bg-background rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                    {p.isNew && (
                      <span className="absolute top-2 left-2 bg-accent text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-20">Nouveau</span>
                    )}
                    {p.images && p.images.length > 0 ? (
                      <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                    ) : (
                      <div className="w-1/2 h-2/3 bg-foreground/5 rounded-md flex items-center justify-center text-xs text-black/20 text-center">Image</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-foreground/60 mb-2">{p.brand}</p>
                  <p className={`font-bold text-sm ${p.isOnSale ? 'text-red-500' : 'text-primary'}`}>
                    {p.price > 0 ? `${p.price.toLocaleString('fr-FR')} FCFA` : 'Sur demande'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section Récemment consultés */}
        {recentProducts && recentProducts.length > 1 && (
          <div className="mt-20 pt-10 border-t border-black/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">Récemment consultés</h2>
              <button onClick={clearRecent} className="text-xs text-foreground/50 hover:text-red-500 underline transition-colors">
                Effacer l'historique
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentProducts.filter(p => p.id !== produit.id).map((p) => (
                <Link href={`/produit/${p.slug}`} key={p.id} className="w-32 md:w-48 flex-shrink-0 bg-white rounded-2xl p-3 shadow-sm border border-black/5 flex flex-col group hover:shadow-md transition-all">
                  <div className="aspect-[4/5] bg-background rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 150px, 200px" className="object-cover" />
                    ) : (
                      <div className="text-[10px] text-black/20">Image</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground text-xs md:text-sm group-hover:text-primary transition-colors line-clamp-1">{p.name}</h3>
                  <p className={`font-bold text-xs md:text-sm text-primary mt-1`}>
                    {p.price > 0 ? `${p.price.toLocaleString('fr-FR')} FCFA` : 'Sur demande'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal / Toast d'ajout au panier */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-foreground mb-2">Produit ajouté !</h3>
            <p className="text-center text-foreground/60 mb-8">{produit.name} a été ajouté à votre panier avec succès.</p>
            
            <div className="flex flex-col gap-3">
              <Link 
                href="/panier"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors text-center"
              >
                Voir mon panier
              </Link>
              <button 
                onClick={() => setShowToast(false)}
                className="w-full bg-white border border-black/10 hover:bg-black/5 text-foreground font-semibold py-3 rounded-xl transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out p-4 md:p-12 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black rounded-full p-2 transition-all z-10"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center">
            <Image 
              src={produit.images[parseInt(activeMedia.split('_')[1]) || 0]} 
              alt={produit.name} 
              fill
              className="object-contain" 
              priority
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  );
}
