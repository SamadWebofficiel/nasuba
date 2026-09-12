import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";


let cachedProducts = null;
let fetchPromise = null;

export async function getProducts(forceRefresh = false) {
  if (cachedProducts && !forceRefresh) return cachedProducts;
  
  if (fetchPromise && !forceRefresh) return fetchPromise;

  fetchPromise = (async () => {
    try {
      if (!db) throw new Error("Firebase non initialisé");
      const snapshot = await getDocs(collection(db, "products"));
      const prods = [];
      snapshot.forEach(doc => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      cachedProducts = prods;
      return cachedProducts;
    } catch (err) {
      console.error("Erreur productService", err);
      cachedProducts = [];
      return cachedProducts;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function clearProductsCache() {
  cachedProducts = null;
}
