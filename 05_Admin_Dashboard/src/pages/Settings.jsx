import { useState } from 'react';
import { Save, MapPin, Car, DollarSign, Globe, Shield, Bell } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
          <p className="text-slate-500 text-sm mt-1">Configurez les paramètres globaux de la plateforme Nasuba Voyage.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
          <Save size={18} />
          Enregistrer les modifications
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-4 h-fit">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Globe size={18} /> Général
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <DollarSign size={18} /> Tarifs & Commissions
            </button>
            <button 
              onClick={() => setActiveTab('fleet')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'fleet' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Car size={18} /> Catégories de véhicules
            </button>
            <button 
              onClick={() => setActiveTab('zones')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'zones' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MapPin size={18} /> Zones desservies
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Shield size={18} /> Sécurité & Permissions
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4">Paramètres Généraux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'application</label>
                  <input type="text" defaultValue="Nasuba Voyage" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email de support</label>
                  <input type="email" defaultValue="support@nasuba-voyage.com" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de contact</label>
                  <input type="text" defaultValue="+225 00 00 00 00 00" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Devise principale</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm">
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4">Configuration des Tarifs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Commission de la plateforme (%)</label>
                  <input type="number" defaultValue="15" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Le pourcentage prélevé sur chaque course terminée.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tarif de base minimum (FCFA)</label>
                  <input type="number" defaultValue="500" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix au kilomètre (FCFA)</label>
                  <input type="number" defaultValue="200" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frais d'annulation (FCFA)</label>
                  <input type="number" defaultValue="300" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4 mt-8">Majoration dynamique (Surge Pricing)</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-medium text-slate-800">Activer la majoration automatique</div>
                  <div className="text-sm text-slate-500">Augmente les prix lors des fortes demandes (heures de pointe, pluie).</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4">Catégories de véhicules</h3>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">Standard (Taxi classique)</h4>
                    <p className="text-sm text-slate-500">Véhicules économiques, jusqu'à 4 passagers.</p>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">Modifier</button>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">Confort (VTC)</h4>
                    <p className="text-sm text-slate-500">Véhicules récents et climatisés.</p>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">Modifier</button>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">VIP / Prestige</h4>
                    <p className="text-sm text-slate-500">Véhicules de luxe pour clients premium.</p>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">Modifier</button>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
                + Ajouter une catégorie
              </button>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4">Zones desservies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville principale</label>
                  <input type="text" defaultValue="Abidjan" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rayon d'action (km)</label>
                  <input type="number" defaultValue="50" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
              </div>
              <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="font-medium text-slate-800">Restriction géographique active</div>
                  <div className="text-sm text-slate-500">Les chauffeurs ne peuvent pas recevoir de courses hors zone.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4">Sécurité & Permissions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="font-medium text-slate-800">Double authentification (2FA) obligatoire</div>
                    <div className="text-sm text-slate-500">Pour tous les administrateurs et membres du support.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Délai d'inactivité avant déconnexion automatique (minutes)</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="never">Désactivé</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
