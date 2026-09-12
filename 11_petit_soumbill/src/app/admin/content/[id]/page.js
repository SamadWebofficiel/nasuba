"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createContent, updateContent, getContentById } from "../../../../lib/contentService";
import { getProducts } from "../../../../lib/productService";
import { storage } from "../../../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import Image from "next/image";

export default function ContentEditor({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const isNew = unwrappedParams.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "NEW_ARRIVAL",
    shortDescription: "",
    content: "",
    imageUrl: "",
    videoUrl: "",
    productId: "",
    published: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function init() {
      // Charger les produits pour le select
      const prods = await getProducts();
      setProducts(prods);

      if (!isNew) {
        const data = await getContentById(unwrappedParams.id);
        if (data) {
          setFormData({
            title: data.title || "",
            type: data.type || "NEW_ARRIVAL",
            shortDescription: data.shortDescription || "",
            content: data.content || "",
            imageUrl: data.imageUrl || "",
            videoUrl: data.videoUrl || "",
            productId: data.productId || "",
            published: data.published || false,
          });
        } else {
          alert("Contenu introuvable");
          router.push("/admin/content");
        }
        setLoading(false);
      }
    }
    init();
  }, [unwrappedParams.id, isNew, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!storage) {
      alert("Erreur: Service de stockage non initialisé.");
      return;
    }

    const isImage = type === 'image';
    const isVideo = type === 'video';
    
    if (isImage) setUploadingImage(true);
    if (isVideo) setUploadingVideo(true);
    setUploadProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const storageRef = ref(storage, `contents/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error("Erreur upload:", error);
        alert("Erreur lors de l'upload du fichier.");
        if (isImage) setUploadingImage(false);
        if (isVideo) setUploadingVideo(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (isImage) {
          setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
          setUploadingImage(false);
        }
        if (isVideo) {
          setFormData(prev => ({ ...prev, videoUrl: downloadURL }));
          setUploadingVideo(false);
        }
        setUploadProgress(0);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.type) {
      alert("Le titre et le type sont obligatoires.");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createContent(formData);
      } else {
        await updateContent(unwrappedParams.id, formData);
      }
      router.push("/admin/content");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/content" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-black/5 hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "Nouveau Contenu" : "Modifier le Contenu"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Ligne 1 : Titre et Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <div>
            <label className="block text-sm font-medium mb-2">Titre *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Titre accrocheur..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            >
              <option value="NEW_ARRIVAL">Nouveauté (Apparaît dans Nouveautés)</option>
              <option value="PROMOTION">Promotion (Apparaît dans Promotions)</option>
              <option value="VIDEO">Vidéo (Apparaît dans Découvrez nos parfums)</option>
              <option value="FEATURED_PRODUCT">Mise en avant</option>
              <option value="NEWS">Actualité boutique</option>
            </select>
          </div>
        </div>

        {/* Ligne 2 : Textes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Description courte (Affichée sur les cartes)</label>
            <textarea 
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows="2"
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Un résumé rapide en une ou deux phrases..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contenu principal (Affiché sur la page détaillée)</label>
            <textarea 
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Texte complet de l'article ou de l'annonce..."
            ></textarea>
          </div>
        </div>

        {/* Ligne 3 : Médias */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-lg font-bold mb-4">Médias</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Image de couverture</label>
              {formData.imageUrl ? (
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 border border-black/5">
                  <Image src={formData.imageUrl} alt="Cover" fill className="object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  {uploadingImage ? (
                    <div className="text-center text-primary font-medium">{uploadProgress}%</div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <span className="text-sm text-gray-500">Ajouter une image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImage} />
                </div>
              )}
            </div>

            {/* Vidéo */}
            <div>
              <label className="block text-sm font-medium mb-2">Vidéo (Optionnel)</label>
              {formData.videoUrl ? (
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-black/5">
                  <video src={formData.videoUrl} controls className="w-full h-full object-contain" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, videoUrl: "" }))}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white transition-colors z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  {uploadingVideo ? (
                    <div className="text-center text-primary font-medium">{uploadProgress}%</div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
                        <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <span className="text-sm text-gray-500">Ajouter une vidéo (MP4)</span>
                    </>
                  )}
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingVideo} />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Ligne 4 : Produit et Statut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-black/5 items-start">
          <div>
            <label className="block text-sm font-medium mb-2">Lier à un produit (Optionnel)</label>
            <select 
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
            >
              <option value="">-- Aucun produit lié --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.brand}</option>
              ))}
            </select>
            <p className="text-xs text-foreground/50 mt-2">
              Si lié, un bouton "Découvrir le parfum" s'affichera sur l'article.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">Statut de publication</label>
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-black/10 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{formData.published ? "Publié sur le site" : "Brouillon (Caché)"}</span>
                <span className="text-xs text-foreground/50">Les brouillons ne sont pas visibles publiquement.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link 
            href="/admin/content" 
            className="px-6 py-3 rounded-xl border border-black/10 font-semibold hover:bg-black/5 transition-colors"
          >
            Annuler
          </Link>
          <button 
            type="submit"
            disabled={saving || uploadingImage || uploadingVideo}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
