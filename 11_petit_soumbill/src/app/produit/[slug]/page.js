import ProductClient from "./ProductClient";

import { notFound } from "next/navigation";
import Script from "next/script";

// On utilise l'API REST pour récupérer les données côté serveur de manière propre
async function getProductAndSettings(slug) {
  let product = null;
  let shopName = "Petit Soumbill Parfumerie";
  let url = `https://petitsoumbill.com/produit/${slug}`;

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      // Fetch Product
      const productRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`, {
        next: { revalidate: 60 }
      });
      if (productRes.ok) {
        const data = await productRes.json();
        let products = [];
        if (data.documents && data.documents.length > 0) {
          products = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
              id: doc.name.split('/').pop(),
              name: fields.name?.stringValue || "",
              brand: fields.brand?.stringValue || "",
              price: fields.price?.integerValue ? parseInt(fields.price.integerValue) : 0,
              oldPrice: fields.oldPrice?.integerValue ? parseInt(fields.oldPrice.integerValue) : null,
              volume: fields.volume?.stringValue || "",
              category: fields.category?.stringValue || "",
              description: fields.description?.stringValue || "",
              images: fields.images?.arrayValue?.values ? fields.images.arrayValue.values.map(v => v.stringValue) : [],
              stock: fields.stock?.integerValue ? parseInt(fields.stock.integerValue) : 0,
              isAvailable: fields.isAvailable ? fields.isAvailable.booleanValue !== false : true,
              isNew: fields.isNew ? fields.isNew.booleanValue === true : false,
              isOnSale: fields.isOnSale ? fields.isOnSale.booleanValue === true : false,
              videoUrl: fields.videoUrl?.stringValue || "",
              slug: fields.slug?.stringValue || fields.name?.stringValue?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "",
              fragranceNotes: fields.fragranceNotes?.arrayValue?.values ? fields.fragranceNotes.arrayValue.values.map(v => v.stringValue) : []
            };
          });
        }
        
        // DUMMY PRODUCTS FALLBACK (same as productService.js)
        if (products.length === 0) {
          products = [
            {
              id: "dummy_1",
              name: "Authentic Pour Homme",
              slug: "authentic-pour-homme",
              brand: "FW",
              price: 0,
              stock: 10,
              isAvailable: true,
              images: ["/images/products/perfume_1.jpg"],
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
              images: ["/images/products/perfume_2.jpg"],
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
              images: ["/images/products/perfume_3.jpg"],
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
              images: ["/images/products/perfume_4.jpg"],
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
              images: ["/images/products/perfume_5.jpg"],
              description: "Une fragrance intense pour l'homme moderne.",
            }
          ];
        }
        
        product = products.find(p => p.slug === slug);
      }

      // Fetch Global Settings for Shop Name
      const settingsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/global`, {
        next: { revalidate: 3600 }
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.fields?.shopName?.stringValue) {
          shopName = settingsData.fields.shopName.stringValue;
        }
      }
    }
  } catch (error) {
    console.error("Erreur serveur lors de la récupération du produit:", error);
  }

  return { product, shopName, url };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product, shopName, url } = await getProductAndSettings(slug);

  if (!product) {
    return {
      title: "Produit Introuvable",
    };
  }

  return {
    title: `${product.name} | ${shopName}`,
    description: `Achetez ${product.name} par ${product.brand} à ${product.price} FCFA chez ${shopName}.`,
    openGraph: {
      title: `${product.name} - ${product.price} FCFA`,
      description: `Découvrez ${product.name}, disponible chez ${shopName}.`,
      url: url,
      siteName: shopName,
      images: [
        {
          url: product.images?.[0] || 'https://petitsoumbill.com/logo.png',
          width: 800,
          height: 800,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${shopName}`,
      description: `Découvrez ${product.name}, disponible chez ${shopName} à ${product.price} FCFA.`,
      images: [product.images?.[0] || 'https://petitsoumbill.com/logo.png'],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { product, shopName, url } = await getProductAndSettings(slug);

  if (!product) {
    notFound();
  }

  // Structured Data (JSON-LD Schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "XOF",
      "price": product.price,
      "availability": product.isAvailable && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": shopName
      }
    }
  };

  return (
    <>
      <Script
        id={`product-jsonld-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient product={product} shopName={shopName} />
    </>
  );
}
