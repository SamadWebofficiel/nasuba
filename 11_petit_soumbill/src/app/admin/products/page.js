"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Link from "next/link";
import Image from "next/image";

let cachedProducts = null;

export default function ProductsAdmin() {
  const [products, setProducts] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      if (!db) return;
      if (!cachedProducts) setLoading(true);
      
      const snapshot = await getDocs(collection(db, "products"));
      const prods = [];
      snapshot.forEach(doc => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      
      setProducts(prods);
      cachedProducts = prods;
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des produits.");
      if (!cachedProducts) setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (produit) => {
    if (window.confirm(`Voulez-vous vraiment supprimer définitivement le parfum "${produit.name}" ?`)) {
      try {
        if (storage) {
          if (produit.images && produit.images.length > 0) {
            for (const url of produit.images) {
              if (url.includes("firebasestorage")) {
                try { await deleteObject(ref(storage, url)); } catch(e) { console.error("Err img", e); }
              }
            }
          }
          if (produit.videoUrl && produit.videoUrl.includes("firebasestorage")) {
             try { await deleteObject(ref(storage, produit.videoUrl)); } catch(e) { console.error("Err vid", e); }
          }
        }

        await deleteDoc(doc(db, "products", produit.id));
        
        const newProducts = products.filter(p => p.id !== produit.id);
        setProducts(newProducts);
        cachedProducts = newProducts; // update cache
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const prodRef = doc(db, "products", id);
      await updateDoc(prodRef, { isAvailable: !currentStatus });
      setProducts(products.map(p => p.id === id ? { ...p, isAvailable: !currentStatus } : p));
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de statut.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestion des Produits</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Ajouter un parfum
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Rechercher par nom ou marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3 text-black/40">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <div className="text-sm font-medium text-foreground/60 hidden md:block">
          {filteredProducts.length} produit(s)
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-black/5 text-sm text-foreground/70">
              <th className="p-4 font-semibold">Produit</th>
              <th className="p-4 font-semibold">Catégorie</th>
              <th className="p-4 font-semibold text-right">Prix</th>
              <th className="p-4 font-semibold text-center">Stock</th>
              <th className="p-4 font-semibold text-center">Statut</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 text-sm">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-foreground/50">Aucun produit trouvé.</td>
              </tr>
            ) : (
              filteredProducts.map((produit) => (
                <tr key={produit.id} className="hover:bg-black/5 transition-colors group">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-background border border-black/5 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      {produit.images && produit.images.length > 0 ? (
                        <Image src={produit.images[0]} alt={produit.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400">Vide</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground line-clamp-1">{produit.name}</p>
                      <p className="text-xs text-foreground/60">{produit.brand}</p>
                    </div>
                  </td>
                  <td className="p-4 text-foreground/80">{produit.category}</td>
                  <td className="p-4 text-right">
                    <p className="font-bold text-foreground">
                      {produit.price > 0 ? `${produit.price.toLocaleString('fr-FR')} F` : '-'}
                    </p>
                    {produit.isOnSale && produit.oldPrice > 0 && (
                      <p className="text-[10px] text-red-500 line-through">{produit.oldPrice.toLocaleString('fr-FR')} F</p>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {produit.stock > 0 ? (
                      <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded text-xs">{produit.stock}</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded text-xs">Rupture</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(produit.id, produit.isAvailable)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        produit.isAvailable 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={produit.isAvailable ? "Désactiver" : "Activer"}
                    >
                      {produit.isAvailable ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/products/${produit.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(produit)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
