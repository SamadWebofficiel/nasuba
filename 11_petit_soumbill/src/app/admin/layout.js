"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirection de secours si l'utilisateur est déconnecté depuis Firebase (ex: expiration)
    // Le middleware gère déjà la vérification initiale de manière invisible.
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-foreground/50 text-sm">Vérification de la session...</p>
      </div>
    );
  }

  // Si on est sur la page de login, on ne montre pas la sidebar
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Si non connecté (et pas en train de charger), on ne rend rien car le useEffect va rediriger
  if (!user) return null;

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      // Le composant AuthContext va automatiquement supprimer le cookie via removeSession()
      // La redirection se fera naturellement via le useEffect ci-dessus, mais on force pour être sûr :
      router.push("/admin/login");
    } catch (error) {
      console.error("Erreur de déconnexion", error);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Produits", href: "/admin/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { name: "Commandes", href: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { name: "Catégories", href: "/admin/categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { name: "Vidéos", href: "/admin/videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
    { name: "Contenus", href: "/admin/content", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" },
    { name: "Paramètres", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-black/5">
        <div className="p-6 border-b border-black/5">
          <Link href="/" className="font-bold text-xl text-primary block text-center">
            Petit Soumbill
            <span className="block text-xs text-foreground/50 uppercase tracking-widest mt-1">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-primary text-white font-medium" 
                        : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2 : 1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      {item.name === "Paramètres" && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                    </svg>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-black/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden bg-white border-b border-black/5 h-16 flex items-center justify-between px-4 z-20">
          <Link href="/admin" className="font-bold text-primary">Admin</Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground p-2 -mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-black/5 z-10 shadow-lg">
            <ul className="p-4 space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg ${
                      pathname === item.href ? "bg-primary text-white font-medium" : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-lg text-red-500 mt-2"
                >
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
