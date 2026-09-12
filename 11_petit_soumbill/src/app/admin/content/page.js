"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getContents, deleteContent, updateContent } from "../../../lib/contentService";
import Image from "next/image";

const typeLabels = {
  NEW_ARRIVAL: "Nouveauté",
  FEATURED_PRODUCT: "Mise en avant",
  PROMOTION: "Promotion",
  VIDEO: "Vidéo",
  NEWS: "Actualité"
};

export default function AdminContents() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  async function fetchContents() {
    setLoading(true);
    const data = await getContents();
    setContents(data);
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce contenu ?")) {
      try {
        await deleteContent(id);
        setContents(contents.filter(c => c.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const togglePublish = async (content) => {
    try {
      await updateContent(content.id, { published: !content.published });
      setContents(contents.map(c => c.id === content.id ? { ...c, published: !c.published } : c));
    } catch (err) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contenus & Actualités</h1>
          <p className="text-sm text-foreground/60">Gérez les éléments dynamiques de l'accueil et du site.</p>
        </div>
        <Link 
          href="/admin/content/new" 
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouveau contenu
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : contents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-black/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-foreground/20 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-foreground/60 text-lg mb-4">Aucun contenu créé pour le moment.</p>
          <Link href="/admin/content/new" className="text-primary font-semibold hover:underline">
            Créer votre premier contenu
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-black/5 text-sm text-foreground/60">
                  <th className="px-6 py-4 font-medium">Contenu</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {contents.map(content => (
                  <tr key={content.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative">
                          {content.imageUrl ? (
                            <Image src={content.imageUrl} alt={content.title} fill className="object-cover" sizes="48px" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm line-clamp-1">{content.title}</div>
                          <div className="text-xs text-foreground/50 line-clamp-1">{content.shortDescription}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {typeLabels[content.type] || content.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/70">
                      {content.createdAt ? new Date(content.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePublish(content)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${content.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                      >
                        {content.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {content.published && (
                          <Link 
                            href={`/actualites/${content.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir sur le site"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </Link>
                        )}
                        <Link 
                          href={`/admin/content/edit/${content.id}`} 
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDelete(content.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
