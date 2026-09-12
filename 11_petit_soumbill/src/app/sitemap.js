
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://petitsoumbill.com';
  let products = [];

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`, {
        next: { revalidate: 3600 } // Cache d'une heure
      });
      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          products = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
              slug: fields.slug?.stringValue || fields.name?.stringValue?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "",
              updatedAt: doc.updateTime
            };
          }).filter(p => p.slug);
        }
      }
    }
  } catch (error) {
    console.error("Sitemap: Impossible de récupérer les produits Firebase", error);
  }

  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/boutique`, lastModified: new Date() },
    { url: `${baseUrl}/nouveautes`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
  ];

  const productPages = products.map((product) => ({
    url: `${baseUrl}/produit/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
  }));

  return [...staticPages, ...productPages];
}
