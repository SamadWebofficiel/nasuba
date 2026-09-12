import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useRecentStore = create(
  persist(
    (set, get) => ({
      recentProducts: [], // Liste d'objets { id, name, image, price, slug }
      
      addRecent: (product) => {
        const { recentProducts } = get();
        // Eviter les doublons en retirant l'ancien s'il existe
        const filtered = recentProducts.filter(p => p.id !== product.id);
        // Ajouter en premier
        filtered.unshift({
          id: product.id,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          slug: product.slug
        });
        
        // Garder uniquement les 10 derniers
        set({ recentProducts: filtered.slice(0, 10) });
      },

      clearRecent: () => {
        set({ recentProducts: [] });
      }
    }),
    {
      name: "petit-soumbill-recent",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useRecentStore;
