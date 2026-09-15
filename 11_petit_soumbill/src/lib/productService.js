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
      if (prods.length === 0) {
        prods.push(
          {
            id: "dummy_1",
            name: "Authentic Pour Homme",
            slug: "authentic-pour-homme",
            brand: "FW",
            price: 0,
            stock: 10,
            isAvailable: true,
            images: ["/images/products/authentic.png"],
            description: "Un parfum authentique pour homme.",
          },
          {
            id: "dummy_2",
            name: "Black Leather",
            slug: "black-leather",
            brand: "Fragrance World",
            price: 0,
            stock: 10,
            isAvailable: true,
            images: ["/images/products/black_leather.png"],
            description: "Eau de parfum pour homme.",
          },
          {
            id: "dummy_3",
            name: "Charuto Tobacco Vanille",
            slug: "charuto-tobacco-vanille",
            brand: "Pendora Scents",
            price: 0,
            stock: 10,
            isAvailable: true,
            images: ["/images/products/charuto.png"],
            description: "Un mélange riche de tabac et de vanille.",
          },
          {
            id: "dummy_4",
            name: "Suave Elixir",
            slug: "suave-elixir",
            brand: "Fragrance World",
            price: 0,
            stock: 10,
            isAvailable: true,
            images: ["/images/products/suave.png"],
            description: "L'élixir de la séduction.",
          },
          {
            id: "dummy_5",
            name: "Intense Wayfarer Homme",
            slug: "intense-wayfarer-homme",
            brand: "Pendora Scents",
            price: 0,
            stock: 10,
            isAvailable: true,
            images: ["/images/products/intense_wayfarer.png"],
            description: "Une fragrance intense pour l'homme moderne.",
          }
        );
      }
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
