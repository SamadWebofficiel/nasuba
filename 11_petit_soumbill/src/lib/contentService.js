import { db } from "./firebase";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";

// Types de contenus autorisés : 'NEW_ARRIVAL', 'FEATURED_PRODUCT', 'PROMOTION', 'VIDEO', 'NEWS'

export async function getContents() {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    // Pas de orderBy car requiert index composite, on triera côté client
    const q = query(collection(db, "contents"));
    const snapshot = await getDocs(q);
    const contents = [];
    snapshot.forEach(doc => {
      contents.push({ id: doc.id, ...doc.data() });
    });
    // Tri par date décroissante
    return contents.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (err) {
    console.error("Erreur getContents", err);
    return [];
  }
}

export async function getPublishedContents() {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    const q = query(collection(db, "contents"), where("published", "==", true));
    const snapshot = await getDocs(q);
    const contents = [];
    snapshot.forEach(doc => {
      contents.push({ id: doc.id, ...doc.data() });
    });
    // Tri par date décroissante
    return contents.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (err) {
    console.error("Erreur getPublishedContents", err);
    return [];
  }
}

export async function getContentBySlug(slug) {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    const q = query(collection(db, "contents"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() };
  } catch (err) {
    console.error("Erreur getContentBySlug", err);
    return null;
  }
}

export async function getContentById(id) {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    const docRef = doc(db, "contents", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (err) {
    console.error("Erreur getContentById", err);
    return null;
  }
}

export async function createContent(data) {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    
    // Slug generation
    let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let exists = await getContentBySlug(slug);
    if (exists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const contentRef = doc(collection(db, "contents"));
    const contentData = {
      ...data,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(contentRef, contentData);
    return contentRef.id;
  } catch (err) {
    console.error("Erreur createContent", err);
    throw err;
  }
}

export async function updateContent(id, data) {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    const contentRef = doc(db, "contents", id);
    await updateDoc(contentRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (err) {
    console.error("Erreur updateContent", err);
    throw err;
  }
}

export async function deleteContent(id) {
  try {
    if (!db) throw new Error("Firebase non initialisé");
    const contentRef = doc(db, "contents", id);
    await deleteDoc(contentRef);
    return true;
  } catch (err) {
    console.error("Erreur deleteContent", err);
    throw err;
  }
}
