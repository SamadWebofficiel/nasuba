import NewsClient from "./NewsClient";
import { notFound } from "next/navigation";
import Script from "next/script";

async function getContentAndSettings(slug) {
  let content = null;
  let shopName = "Petit Soumbill Parfumerie";
  let url = `https://petitsoumbill.com/actualites/${slug}`;

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/contents`, {
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          const contents = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
              id: doc.name.split('/').pop(),
              title: fields.title?.stringValue || "",
              slug: fields.slug?.stringValue || "",
              type: fields.type?.stringValue || "NEWS",
              shortDescription: fields.shortDescription?.stringValue || "",
              content: fields.content?.stringValue || "",
              imageUrl: fields.imageUrl?.stringValue || "",
              videoUrl: fields.videoUrl?.stringValue || "",
              productId: fields.productId?.stringValue || "",
              published: fields.published ? fields.published.booleanValue === true : false,
              createdAt: fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue) : new Date(),
            };
          });
          
          content = contents.find(c => c.slug === slug);
        }
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
    console.error("Erreur serveur lors de la récupération du contenu:", error);
  }

  return { content, shopName, url };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { content, shopName, url } = await getContentAndSettings(slug);

  if (!content || !content.published) {
    return { title: "Contenu Introuvable" };
  }

  return {
    title: `${content.title} | ${shopName}`,
    description: content.shortDescription || `Découvrez ${content.title} sur ${shopName}.`,
    openGraph: {
      title: content.title,
      description: content.shortDescription || `Découvrez ${content.title} sur ${shopName}.`,
      url: url,
      siteName: shopName,
      images: [
        {
          url: content.imageUrl || 'https://petitsoumbill.com/logo.png',
          width: 800,
          height: 800,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.shortDescription,
      images: [content.imageUrl || 'https://petitsoumbill.com/logo.png'],
    },
  };
}

export default async function NewsPage({ params }) {
  const { slug } = await params;
  const { content, shopName, url } = await getContentAndSettings(slug);

  if (!content || !content.published) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": content.title,
    "image": content.imageUrl ? [content.imageUrl] : [],
    "datePublished": content.createdAt.toISOString(),
    "description": content.shortDescription,
    "publisher": {
      "@type": "Organization",
      "name": shopName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://petitsoumbill.com/logo.png"
      }
    }
  };

  return (
    <>
      <Script
        id={`news-jsonld-${content.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsClient content={content} shopName={shopName} />
    </>
  );
}
