import React, { useState } from 'react';
import { Search, Eye, Filter } from 'lucide-react';

const Quotes = () => {
  const [quotes] = useState([
    {
      id: 'Q-001',
      client: 'Sonia Dossou',
      service: 'Événementiel (Mariage)',
      date: '12/10/2026',
      status: 'waiting_driver',
      offers: 0,
    },
    {
      id: 'Q-002',
      client: 'Entreprise ABC',
      service: 'Marchandise (Camion Plateau)',
      date: '15/10/2026',
      status: 'offers_received',
      offers: 3,
    },
    {
      id: 'Q-003',
      client: 'Famille Mensah',
      service: 'Funéraire',
      date: '20/08/2026',
      status: 'accepted',
      offers: 1,
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Suivi des Devis</h2>
          <p className="text-slate-500">Supervisez les demandes de devis entre clients et prestataires.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un devis..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter size={16} />
            Filtrer
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Référence</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Date prévue</th>
                <th className="px-6 py-4 font-semibold text-center">Offres reçues</th>
                <th className="px-6 py-4 font-semibold text-center">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{quote.id}</td>
                  <td className="px-6 py-4">{quote.client}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                      {quote.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{quote.date}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{quote.offers}</td>
                  <td className="px-6 py-4 text-center">
                    {quote.status === 'waiting_driver' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        En attente de devis
                      </span>
                    )}
                    {quote.status === 'offers_received' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        Devis proposés
                      </span>
                    )}
                    {quote.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        Devis accepté
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors" title="Détails du devis">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Quotes;
