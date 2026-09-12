import { create } from "zustand";

const useUIStore = create((set) => ({
  whatsappMessage: "Bonjour, j'aimerais avoir plus d'informations.",
  setWhatsappMessage: (msg) => set({ whatsappMessage: msg }),
}));

export default useUIStore;
