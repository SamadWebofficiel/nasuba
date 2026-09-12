"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import useCartStore from '../store/cartStore';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-primary/10 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 -ml-2 text-foreground focus:outline-none" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
          <span>Petit Soumbill</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center font-medium text-sm">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
          <Link href="/nouveautes" className="hover:text-primary transition-colors">Nouveautés</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Notre Boutique</Link>
        </nav>

        {/* Cart Icon */}
        <Link href="/panier" className="p-2 -mr-2 text-foreground relative hover:text-primary transition-colors">
          <span className="sr-only">Panier</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {mounted && totalItems > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </Link>

      </div>
    </header>
  );
}
