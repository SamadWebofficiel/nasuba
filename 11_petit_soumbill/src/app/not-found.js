import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6 text-foreground/40">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Cette page n'existe pas</h2>
      <p className="text-foreground/60 max-w-md mb-8">
        Le parfum ou la page que vous recherchez semble s'être évaporé. Il a peut-être été déplacé ou n'a jamais existé.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/boutique" 
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg shadow-primary/30"
        >
          Retour à la boutique
        </Link>
        <Link 
          href="/" 
          className="bg-white border-2 border-foreground hover:bg-foreground/5 text-foreground font-semibold py-3 px-8 rounded-full transition-colors"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
