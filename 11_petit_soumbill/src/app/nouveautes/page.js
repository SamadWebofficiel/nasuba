import Link from "next/link";

export default function Nouveautes() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">De Nouvelles Fragrances Arrivent</h1>
      <p className="text-lg text-foreground/60 max-w-2xl mb-8">
        Veuillez patienter pendant que nous préparons notre nouvelle collection. Les meilleures sélections mondiales atterriront bientôt dans notre catalogue.
      </p>
      <Link 
        href="/boutique" 
        className="bg-foreground hover:bg-black text-background font-semibold py-3 px-8 rounded-full transition-colors shadow-lg"
      >
        Explorer notre catalogue actuel
      </Link>
    </div>
  );
}
