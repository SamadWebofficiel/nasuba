"use client";

import { useState, useEffect, use } from "react";
import { db, storage } from "../../../../lib/firebase";
import { collection, doc, getDoc, setDoc, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductForm({ params }) {
  const unwrappedParams = use(params);
  const isNew = unwrappedParams.id === "new";
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    brand: "",
    category: "",
    price: 0,
    oldPrice: 0,
    volume: "100ml",
    description: "",
    fragranceNotes: [],
    stock: 0,
    images: [],
    videoUrl: "",
    isAvailable: true,
    isNew: false,
    isFeatured: false,
    isOnSale: false,
  });

  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const cats = [];
        catSnap.forEach(doc => cats.push(doc.data().name));
        if (cats.length === 0) cats.push("Homme", "Femme", "Unisexe");
        setCategories(cats);
        
        if (isNew) {
          setFormData(prev => ({ ...prev, category: cats[0] }));
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      }

      // Fetch product if editing
      if (!isNew) {
        try {
          const docRef = doc(db, "products", unwrappedParams.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              ...data,
              oldPrice: data.oldPrice || 0,
              fragranceNotes: data.fragranceNotes || [],
              images: data.images || []
            });
          } else {
            setError("Produit introuvable.");
          }
        } catch (err) {
          console.error(err);
          setError("Erreur de chargement du produit.");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [isNew, unwrappedParams.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-generate slug from name if creating
    if (name === "name" && isNew) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        slug: generatedSlug 
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value)
    }));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (noteInput.trim() && !formData.fragranceNotes.includes(noteInput.trim())) {
      setFormData(prev => ({ ...prev, fragranceNotes: [...prev.fragranceNotes, noteInput.trim()] }));
      setNoteInput("");
    }
  };

  const removeNote = (noteToRemove) => {
    setFormData(prev => ({ ...prev, fragranceNotes: prev.fragranceNotes.filter(n => n !== noteToRemove) }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (!storage) {
      alert("Firebase Storage n'est pas initialisé.");
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop lourd. Limite : 5 Mo.`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image valide.`);
        continue;
      }

      try {
        const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(fileRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        uploadedUrls.push(downloadURL);
      } catch (err) {
        console.error("Upload error", err);
        alert(`Erreur lors de l'upload de ${file.name}`);
      }
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
  };

  const removeImage = async (urlToRemove) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette photo ?")) return;
    
    setFormData(prev => ({ ...prev, images: prev.images.filter(url => url !== urlToRemove) }));
    
    if (urlToRemove.includes("firebasestorage")) {
      try {
        const fileRef = ref(storage, urlToRemove);
        await deleteObject(fileRef);
      } catch (err) {
        console.error("Erreur de suppression image", err);
      }
    }
  };

  const setMainImage = (urlToMakeMain) => {
    setFormData(prev => {
      const newImages = prev.images.filter(url => url !== urlToMakeMain);
      return { ...prev, images: [urlToMakeMain, ...newImages] };
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!storage) {
      alert("Firebase Storage n'est pas initialisé.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("La vidéo est trop lourde. Veuillez choisir une vidéo de moins de 50 Mo.");
      return;
    }
    if (!file.type.startsWith('video/')) {
      alert("Le fichier n'est pas une vidéo valide.");
      return;
    }

    setUploading(true);
    try {
      const fileRef = ref(storage, `products/videos/${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      setFormData(prev => ({ ...prev, videoUrl: downloadURL }));
    } catch (err) {
      console.error("Upload error", err);
      alert("Erreur lors de l'upload de la vidéo.");
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;
    
    const urlToRemove = formData.videoUrl;
    setFormData(prev => ({ ...prev, videoUrl: "" }));
    
    if (urlToRemove && urlToRemove.includes("firebasestorage")) {
      try {
        const fileRef = ref(storage, urlToRemove);
        await deleteObject(fileRef);
      } catch (err) {
        console.error("Erreur de suppression vidéo", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setError("Le nom et le slug sont obligatoires.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const dataToSave = {
        ...formData,
        updatedAt: new Date()
      };

      if (isNew) {
        dataToSave.createdAt = new Date();
        await addDoc(collection(db, "products"), dataToSave);
      } else {
        await setDoc(doc(db, "products", unwrappedParams.id), dataToSave, { merge: true });
      }

      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement du produit.");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {isNew ? "Ajouter un parfum" : "Modifier le parfum"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Informations Générales */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2">Informations Générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du parfum *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Identifiant URL (slug) *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marque</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none bg-white">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none resize-y" />
            </div>
          </div>
        </div>

        {/* Tarification & Stock */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2">Tarification & Inventaire</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Prix de vente (FCFA)</label>
              <input type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ancien prix (FCFA - optionnel)</label>
              <input type="number" min="0" name="oldPrice" value={formData.oldPrice} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantité en stock</label>
              <input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contenance (ex: 100ml)</label>
              <input type="text" name="volume" value={formData.volume} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Accords Principaux */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2">Accords Olfactifs</h2>
          
          <div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={noteInput} 
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote(e)}
                placeholder="Ex: Vanille, Cuir, Boisé..." 
                className="flex-1 p-2.5 rounded-lg border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none" 
              />
              <button onClick={handleAddNote} type="button" className="bg-black/5 hover:bg-black/10 px-4 rounded-lg font-medium transition-colors">
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.fragranceNotes.map(note => (
                <span key={note} className="bg-background border border-black/10 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                  {note}
                  <button type="button" onClick={() => removeNote(note)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                </span>
              ))}
              {formData.fragranceNotes.length === 0 && <span className="text-sm text-gray-400 italic">Aucune note olfactive ajoutée</span>}
            </div>
          </div>
        </div>

        {/* Médias */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2">Images & Vidéo</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Photos du produit (la 1ère est l'image principale)</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {formData.images.map((url, index) => (
                <div key={url} className={`relative w-28 h-28 rounded-lg border ${index === 0 ? 'border-primary border-2' : 'border-black/10'} overflow-hidden group`}>
                  <img src={url} alt="Aperçu" className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                    {index !== 0 && (
                      <button 
                        type="button" 
                        onClick={() => setMainImage(url)}
                        className="text-xs bg-white text-black px-2 py-1 rounded shadow-sm hover:bg-gray-100"
                      >
                        Principale
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeImage(url)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded shadow-sm hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Main</span>
                  )}
                </div>
              ))}
              <label className="w-28 h-28 rounded-lg border-2 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-2xl text-black/40">+</span>
                    <span className="text-xs text-black/40 font-medium">Ajouter</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            
            <label className="block text-sm font-medium mb-1 mt-8">Vidéo du produit (Format vertical recommandé)</label>
            
            {formData.videoUrl ? (
              <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-black/10 group">
                <video src={formData.videoUrl} controls className="w-full h-auto bg-black max-h-64 object-contain"></video>
                <button 
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="w-full flex items-center gap-4 p-4 rounded-lg border border-black/10 cursor-pointer hover:bg-black/5 transition-colors">
                <div className="w-12 h-12 rounded bg-foreground flex items-center justify-center text-white shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ajouter une vidéo</p>
                  <p className="text-sm text-foreground/50">Cliquez pour uploader un fichier (max 50Mo)</p>
                </div>
                <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
              </label>
            )}
            
          </div>
        </div>

        {/* Options / Statuts */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-black/5 pb-2">Options d'affichage</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-black/5 cursor-pointer hover:bg-black/5 transition-colors">
              <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-5 h-5 accent-primary" />
              <div>
                <p className="font-medium text-sm">Produit Actif</p>
                <p className="text-xs text-foreground/50">Visible sur la boutique</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 rounded-lg border border-black/5 cursor-pointer hover:bg-black/5 transition-colors">
              <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-5 h-5 accent-primary" />
              <div>
                <p className="font-medium text-sm">Nouveauté</p>
                <p className="text-xs text-foreground/50">Affiche le badge "Nouveau"</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-black/5 cursor-pointer hover:bg-black/5 transition-colors">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 accent-primary" />
              <div>
                <p className="font-medium text-sm">En vedette</p>
                <p className="text-xs text-foreground/50">Mis en avant sur l'accueil</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-black/5 cursor-pointer hover:bg-black/5 transition-colors">
              <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} className="w-5 h-5 accent-primary" />
              <div>
                <p className="font-medium text-sm">En Promotion</p>
                <p className="text-xs text-foreground/50">Affiche le badge "Promo"</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving || uploading}
            className="bg-primary hover:bg-primary-hover text-white px-10 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Enregistrer le parfum"}
          </button>
        </div>

      </form>
    </div>
  );
}
