import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const useAuthStore = create((set, get) => ({
  user: null,
  adminData: null,
  loading: true,
  initialize: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ loading: true });
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            set({ user, adminData: adminDoc.data(), loading: false });
          } else {
            // En production : l'utilisateur DOIT exister dans la collection 'admins'
            // SAUF s'il est en train de configurer le compte (page /setup)
            if (window.location.pathname !== '/setup') {
              console.warn("Accès refusé : Cet utilisateur n'est pas un administrateur.");
              await signOut(auth);
            }
            set({ user: null, adminData: null, loading: false });
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
          set({ user: null, adminData: null, loading: false });
        }
      } else {
        set({ user: null, adminData: null, loading: false });
      }
    });
  },
  hasPermission: (permission) => {
    const { adminData } = get();
    if (!adminData) return false;
    if (adminData.role === 'OWNER') return true;
    return adminData.permissions?.includes(permission) || false;
  },
  isOwner: () => {
    const { adminData } = get();
    return adminData?.role === 'OWNER';
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, adminData: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}));

export default useAuthStore;
