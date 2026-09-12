"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getProducts } from "../../../lib/productService";

export default function NewsClient({ content, shopName }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      if (content.productId) {
        const prods = await getProducts();
        const linkedProd = prods.find(p => p.id === content.productId);
        if (linkedProd && linkedProd.isAvailable !== false) {
          setProduct(linkedProd);
        }
      }
    }
    loadProduct();
  }, [content.productId]);

  const handleShare = async () => {
    const shareData = {
      title: `${content.title} | ${shopName}`,
      text: content.shortDescription || `Découvrez ${content.title}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Partage annulé ou échoué", err);
      }
    } else {
      const message = encodeURIComponent(`${shareData.text}\n\nLire la suite : ${shareData.url}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      
      {/* Fil d'ariane */}
      <nav className="text-sm text-foreground/60 mb-8">
        <Link href="/" className="hover:text-primary">Accueil</Link> &gt;{" "}
        <span className="text-foreground">Actualités</span> &gt;{" "}
        <span className="text-foreground line-clamp-1 inline-block align-bottom">{content.title}</span>
      </nav>

      {/* En-tête de l'article */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{content.title}</h1>
        <div className="flex items-center gap-4 text-sm text-foreground/60 mb-6">
          <span>{new Date(content.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/30"></span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{content.type === 'NEW_ARRIVAL' ? 'Nouveauté' : content.type === 'PROMOTION' ? 'Promotion' : content.type === 'VIDEO' ? 'Vidéo' : 'Actualité'}</span>
        </div>
      </header>

      {/* Médias */}
      {content.videoUrl ? (
        <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden mb-10 shadow-lg border border-black/5">
          <video src={content.videoUrl} controls autoPlay className="w-full h-full object-contain" />
        </div>
      ) : content.imageUrl ? (
        <div className="w-full aspect-video relative rounded-3xl overflow-hidden mb-10 shadow-lg border border-black/5">
          <Image src={content.imageUrl} alt={content.title} fill className="object-cover" priority />
        </div>
      ) : null}

      {/* Contenu Texte */}
      <div className="prose prose-lg max-w-none text-foreground/80 mb-12 whitespace-pre-line">
        {content.content}
      </div>

      {/* Produit Lié */}
      {product && (
        <div className="my-12 p-6 md:p-8 bg-white border border-black/10 shadow-xl rounded-3xl flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 md:w-48 md:h-48 relative rounded-2xl overflow-hidden bg-background flex-shrink-0">
            {product.images && product.images.length > 0 ? (
               <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-xs text-black/20">Image</div>
            )}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            <p className="text-primary font-bold text-xl mb-4">{product.price.toLocaleString('fr-FR')} FCFA</p>
            <Link 
              href={`/produit/${product.slug}`}
              className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm"
            >
              Découvrir le parfum
            </Link>
          </div>
        </div>
      )}

      {/* Pied de page et Partage */}
      <footer className="pt-8 border-t border-black/10 flex justify-between items-center">
        <Link href="/" className="text-foreground/60 hover:text-primary font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Retour à l'accueil
        </Link>
        
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors bg-white px-4 py-2 rounded-full border border-black/10 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          Partager
        </button>
      </footer>

    </article>
  );
}
