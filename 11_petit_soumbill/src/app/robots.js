export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin/*'],
      },
    ],
    // Sera dynamique une fois le vrai domaine obtenu, on utilise un chemin générique
    sitemap: 'https://petitsoumbill.com/sitemap.xml',
  }
}
