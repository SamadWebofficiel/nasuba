import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Petit Soumbill Parfumerie | Parfums à Parakou",
  description: "Découvrez les parfums pour hommes, femmes et unisexes de Petit Soumbill Parfumerie à Parakou, Bénin.",
  openGraph: {
    title: "Petit Soumbill Parfumerie",
    description: "Découvrez les parfums pour hommes, femmes et unisexes de Petit Soumbill Parfumerie à Parakou, Bénin.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://petitsoumbill.com",
    siteName: "Petit Soumbill Parfumerie",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${outfit.variable} antialiased min-h-screen flex flex-col font-sans bg-background text-foreground`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <FloatingWhatsApp />
        </AuthProvider>
      </body>
    </html>
  );
}
