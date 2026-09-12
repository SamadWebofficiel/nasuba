import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFavoritesStore = create(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (product) => {
        const currentItems = get().items;
        if (!currentItems.find((p) => p.id === product.id)) {
          set({ items: [...currentItems, product] });
        }
      },
      removeFavorite: (productId) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },
      toggleFavorite: (product) => {
        const currentItems = get().items;
        if (currentItems.find((p) => p.id === product.id)) {
          set({ items: currentItems.filter((p) => p.id !== product.id) });
        } else {
          set({ items: [...currentItems, product] });
        }
      },
      isFavorite: (productId) => {
        return get().items.some((p) => p.id === productId);
      }
    }),
    {
      name: "petitsoumbill-favorites", // nom de la clé dans le localStorage
    }
  )
);

export default useFavoritesStore;
