"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) return;
        
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/global`);
        if (res.ok) {
          const data = await res.json();
          if (data.fields) {
            setSettings({
              shopName: data.fields.shopName?.stringValue || "Petit Soumbill Parfumerie",
              city: data.fields.city?.stringValue || "",
              address: data.fields.address?.stringValue || "",
              phone: data.fields.phone?.stringValue || "",
              whatsappNumber: data.fields.whatsappNumber?.stringValue || "",
              hours: data.fields.hours?.stringValue || "",
              facebook: data.fields.facebook?.stringValue || "",
              instagram: data.fields.instagram?.stringValue || "",
              tiktok: data.fields.tiktok?.stringValue || "",
            });
          }
        }
      } catch (e) {
        console.error("Erreur chargement paramètres contact:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const defaultMessage = encodeURIComponent("Bonjour, j'aimerais avoir plus d'informations concernant votre boutique.");
  const whatsappUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}?text=${defaultMessage}` : null;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contactez-nous</h1>
        <p className="text-lg text-foreground/60 max-w-xl mx-auto">
          Une question sur un parfum ? Besoin d'aide pour une commande ? Nous sommes à votre écoute.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-black/5 p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Infos de contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-primary">{settings?.shopName || "Notre Boutique"}</h2>
              
              <div className="space-y-6">
                {(settings?.city || settings?.address) && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Adresse</h3>
                      {settings?.address && <p className="text-foreground/70 mt-1">{settings.address}</p>}
                      {settings?.city && <p className="text-foreground/70">{settings.city}</p>}
                    </div>
                  </div>
                )}

                {settings?.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Horaires</h3>
                      <p className="text-foreground/70 mt-1 whitespace-pre-line">{settings.hours}</p>
                    </div>
                  </div>
                )}

                {settings?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Téléphone</h3>
                      <a href={`tel:${settings.phone}`} className="text-foreground/70 mt-1 hover:text-primary transition-colors block">{settings.phone}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Réseaux sociaux */}
            {(settings?.facebook || settings?.instagram || settings?.tiktok) && (
              <div className="pt-6 border-t border-black/5">
                <h3 className="font-semibold text-foreground mb-4">Suivez-nous</h3>
                <div className="flex gap-4">
                  {settings.facebook && (
                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full flex items-center justify-center transition-colors">
                      <span className="font-bold text-lg">f</span>
                    </a>
                  )}
                  {settings.instagram && (
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full flex items-center justify-center transition-colors">
                      <span className="font-bold text-lg">in</span>
                    </a>
                  )}
                  {settings.tiktok && (
                    <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full flex items-center justify-center transition-colors">
                      <span className="font-bold text-lg">tk</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action principale WhatsApp */}
          <div className="flex flex-col justify-center items-center text-center p-8 bg-foreground rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#25D366]/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Rapide</h2>
              <p className="text-white/80 mb-8 text-sm leading-relaxed">
                Le moyen le plus rapide pour obtenir une réponse est de nous écrire directement sur WhatsApp.
              </p>
              
              {whatsappUrl ? (
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-lg w-full"
                >
                  Discuter sur WhatsApp
                </a>
              ) : (
                <p className="text-primary italic text-sm bg-primary/10 px-4 py-2 rounded-lg">WhatsApp non configuré par l'administration.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
