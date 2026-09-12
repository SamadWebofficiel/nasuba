"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      if (!db) return;
      setLoading(true);
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = [];
      snapshot.forEach(doc => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      
      // Si la collection est vide, on initialise les 3 catégories par défaut localement pour l'affichage
      if (cats.length === 0) {
        cats.push({ id: "1", name: "Homme" }, { id: "2", name: "Femme" }, { id: "3", name: "Unisexe" });
      }
      
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement des catégories");
    } finally {
      setLoading(false);
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    setAdding(true);
    setError("");
    
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCatName.trim(),
        createdAt: new Date()
      });
      setCategories([...categories, { id: docRef.id, name: newCatName.trim() }]);
      setNewCatName("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout de la catégorie");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    // 1. Vérifier si des produits l'utilisent
    try {
      const q = query(collection(db, "products"), where("category", "==", name));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        alert(`Impossible de supprimer cette catégorie car ${snapshot.size} produit(s) y sont associés. Modifiez d'abord ces produits.`);
        return;
      }
      
      if (window.confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ?`)) {
        await deleteDoc(doc(db, "categories", id));
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Gestion des Catégories</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm mb-8">
        <h2 className="font-semibold mb-4 text-foreground">Ajouter une nouvelle catégorie</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nom de la catégorie (ex: Enfants)"
            className="flex-1 p-3 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <button 
            type="submit" 
            disabled={adding || !newCatName.trim()}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {adding ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 bg-gray-50/50">
          <h2 className="font-semibold text-foreground">Catégories Existantes</h2>
        </div>
        <ul className="divide-y divide-black/5">
          {categories.map((cat) => (
            <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-black/5">
              <span className="font-medium text-foreground">{cat.name}</span>
              <button 
                onClick={() => handleDelete(cat.id, cat.name)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
