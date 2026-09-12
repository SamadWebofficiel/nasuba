import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add an item to the cart
      addItem: (product) => set((state) => {
        const existingItem = state.items.find((item) => item.id === product.id);
        
        if (existingItem) {
          // If exists, increment quantity
          return {
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantite: item.quantite + 1 }
                : item
            ),
          };
        }
        
        // If not exists, add to array with quantite = 1
        return {
          items: [...state.items, { ...product, quantite: 1 }],
        };
      }),
      
      // Remove an item entirely
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.id !== productId),
      })),
      
      // Increment quantity
      incrementQuantity: (productId) => set((state) => ({
        items: state.items.map((item) =>
          item.id === productId
            ? { ...item, quantite: item.quantite + 1 }
            : item
        ),
      })),
      
      // Decrement quantity
      decrementQuantity: (productId) => set((state) => {
        const itemToUpdate = state.items.find((item) => item.id === productId);
        
        if (itemToUpdate?.quantite === 1) {
          // If it's 1, remove it
          return {
            items: state.items.filter((item) => item.id !== productId),
          };
        }
        
        return {
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, quantite: item.quantite - 1 }
              : item
          ),
        };
      }),
      
      // Update quantity directly
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity < 1) {
          return {
             items: state.items.filter((item) => item.id !== productId),
          }
        }
        return {
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, quantite: quantity }
              : item
          ),
        };
      }),
      
      // Clear cart
      clearCart: () => set({ items: [] }),

      // Selectors (can be used directly in components)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantite, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.prix * item.quantite), 0);
      }
    }),
    {
      name: 'petit-soumbill-cart', // name of the item in the storage (must be unique)
    }
  )
);

export default useCartStore;
