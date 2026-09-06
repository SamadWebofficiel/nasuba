import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, Star, Loader } from 'lucide-react';
import { logAdminAction } from '../utils/auditLogger';
import useAuthStore from '../store/useAuthStore';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import DriverProfileModal from '../components/DriverProfileModal';

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const { hasPermission } = useAuthStore();
  
  useEffect(() => {
    const q = query(collection(db, 'drivers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driversData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Prestataire Inconnu',
          phone: data.phone || 'Non renseigné',
          city: data.city || 'Non renseignée',
          type: data.type || 'Chauffeur',
          services: data.services || ['Non spécifié'],
          vehicle: data.vehicleName || 'Non spécifié',
          rating: data.rating || 0,
          missions: data.missionsCount || 0,
          validation: data.validationStatus || 'En attente',
          status: data.isOnline ? 'En ligne' : 'Hors ligne',
        };
      });
      setDrivers(driversData);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des prestataires:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSuspend = async (driver) => {
    if (!hasPermission('SUSPEND_USERS')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir suspendre le prestataire ${driver.name} ?`)) {
      try {
        await updateDoc(doc(db, 'drivers', driver.id), { validationStatus: 'Suspendu' });
        await logAdminAction('SUSPEND_PROVIDER', `providerId_${driver.id}`, 'Prestataire suspendu');
      } catch (error) {
        console.error("Erreur de suspension:", error);
        alert("Erreur lors de la suspension.");
      }
    }
  };

  const handleValidate = async (driver) => {
    if (!hasPermission('VERIFY_PROVIDERS')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm(`Confirmer la validation du dossier de ${driver.name} ?`)) {
      try {
        await updateDoc(doc(db, 'drivers', driver.id), { validationStatus: 'Validé' });
        await logAdminAction('VERIFY_PROVIDER', `providerId_${driver.id}`, 'Prestataire validé avec succès');
      } catch (error) {
        console.error("Erreur de validation:", error);
        alert("Erreur lors de la validation.");
      }
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.phone.includes(searchTerm);
    if (filter === 'Tous') return matchesSearch;
    return matchesSearch && d.validation === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un prestataire..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="En attente">En attente de validation</option>
            <option value="Validé">Validés</option>
            <option value="Suspendu">Suspendus</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
            <Filter size={20} />
            <span className="hidden sm:inline">Plus de Filtres</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">Prestataire & Contact</th>
                <th className="px-6 py-4 font-medium">Type / Services</th>
                <th className="px-6 py-4 font-medium">Véhicule principal</th>
                <th className="px-6 py-4 font-medium text-center">Note / Missions</th>
                <th className="px-6 py-4 font-medium">Validation</th>
                <th className="px-6 py-4 font-medium">Disponibilité</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="animate-spin mb-2" size={24} />
                      <p>Chargement des prestataires...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Aucun prestataire trouvé.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{driver.name}</div>
                      <div className="text-sm text-slate-500">{driver.phone} • {driver.city}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mb-1">{driver.type}</span>
                      <div className="text-xs text-slate-500">{Array.isArray(driver.services) ? driver.services.join(', ') : driver.services}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.vehicle}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center text-amber-500 text-sm font-bold">
                          <Star size={14} className="mr-1 fill-current" />
                          {driver.rating}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{driver.missions} missions</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        driver.validation === 'Validé' ? 'bg-emerald-100 text-emerald-800' : 
                        driver.validation === 'Suspendu' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {driver.validation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${driver.status === 'En ligne' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-sm text-slate-600">{driver.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedDriver(driver)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Consulter Profil">
                          <Eye size={18} />
                        </button>
                        {driver.validation === 'En attente' && (
                          <button onClick={() => handleValidate(driver)} className="p-2 text-emerald-500 hover:text-emerald-700 transition-colors" title="Valider Dossier">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => handleSuspend(driver)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Suspendre">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DriverProfileModal 
        driver={selectedDriver} 
        onClose={() => setSelectedDriver(null)} 
      />
    </div>
  );
};

export default Drivers;
