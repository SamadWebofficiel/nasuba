"use client";

import Link from 'next/link';

export default function Footer() {
  const handleShareShop = async () => {
    const shareData = {
      title: 'Petit Soumbill Parfumerie',
      text: 'Découvrez la sélection premium de parfums chez Petit Soumbill Parfumerie à Parakou.',
      url: 'https://petitsoumbill.com'
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Partage annulé ou échoué", err);
      }
    } else {
      const message = encodeURIComponent(`${shareData.text}\n\nVisitez la boutique : ${shareData.url}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  return (
    <footer className="bg-foreground text-background py-12 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold text-accent mb-4">Petit Soumbill Parfumerie</h3>
          <p className="text-sm opacity-80 mb-4 max-w-sm">
            Votre parfum, votre signature. Découvrez notre sélection de parfums pour hommes et femmes à Parakou, Bénin.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold mb-4 text-white">Liens rapides</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
            <li><Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link></li>
            <li><Link href="/panier" className="hover:text-primary transition-colors">Panier</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold mb-4 text-white">Réseaux Sociaux</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="https://www.facebook.com/share/1DGEuZnicD/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">Facebook</a></li>
            <li><a href="https://www.instagram.com/style.fraiche?stkn=MW40Y2VkbDZqMnliNg==" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">Instagram</a></li>
            <li><a href="https://www.tiktok.com/@petitsoumbillparfumeri?_r=1&_t=ZN-99dwwx8seV4" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">TikTok</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4 text-white">Contact & Boutique</h4>
          <address className="not-italic text-sm opacity-80 space-y-4">
            <p>Parakou, Bénin</p>
            <button 
              onClick={handleShareShop}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              Partager la boutique
            </button>
          </address>
        </div>

      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-xs opacity-50 text-center">
        &copy; {new Date().getFullYear()} Petit Soumbill Parfumerie. Tous droits réservés.
      </div>
    </footer>
  );
}
