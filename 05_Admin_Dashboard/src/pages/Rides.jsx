import { useState, useEffect } from 'react';
import { Search, Filter, Map, Clock, CheckCircle, XCircle, MoreHorizontal, Loader } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Rides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          client: data.clientName || 'Inconnu',
          driver: data.driverName || 'En attente',
          from: data.pickupLocation || 'Non spécifié',
          to: data.dropoffLocation || 'Non spécifié',
          price: data.price ? `${data.price} FCFA` : 'Non défini',
          status: data.status || 'pending',
          date: data.createdAt?.toDate().toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) || 'Date inconnue',
        };
      });
      setRides(ridesData);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des courses:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'terminée':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center w-fit"><CheckCircle size={14} className="mr-1"/> Terminée</span>;
      case 'active':
      case 'en cours':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center w-fit"><Map size={14} className="mr-1"/> En cours</span>;
      case 'pending':
      case 'en attente':
        return <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center w-fit"><Clock size={14} className="mr-1"/> En attente</span>;
      case 'cancelled':
      case 'annulée':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center w-fit"><XCircle size={14} className="mr-1"/> Annulée</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center w-fit">{status}</span>;
    }
  };

  const [filterService, setFilterService] = useState('Tous');

  const filteredRides = rides.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'Tous' || (r.serviceType && r.serviceType.toLowerCase().includes(filterService.toLowerCase()));
    return matchesSearch && matchesService;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des Courses</h2>
          <p className="text-slate-500 text-sm mt-1">Suivez l'activité des trajets en temps réel sur la plateforme.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Rechercher une course (ID, Client, Chauffeur)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            >
              <option value="Tous">Tous les services</option>
              <option value="Taxi">Taxi</option>
              <option value="Urgence">Véhicule urgence</option>
              <option value="Médical">Transport médical</option>
              <option value="Marchandises">Transport marchandises</option>
              <option value="Funéraire">Transport funéraire</option>
              <option value="Événement">Événement</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
              <Filter size={16} />
              Statuts
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4">ID Course & Date</th>
                <th scope="col" className="px-6 py-4">Trajet</th>
                <th scope="col" className="px-6 py-4">Utilisateurs</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-700">Prix</th>
                <th scope="col" className="px-6 py-4">Statut</th>
                <th scope="col" className="px-6 py-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="animate-spin mb-2" size={24} />
                      <p>Chargement des courses...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRides.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Aucune course trouvée.
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{ride.id.substring(0, 8)}...</div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <Clock size={12} className="mr-1"/> {ride.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          <span className="truncate max-w-[150px]" title={ride.from}>{ride.from}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                          <span className="truncate max-w-[150px]" title={ride.to}>{ride.to}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="text-slate-400">C:</span> <span className="font-medium text-slate-700">{ride.client}</span>
                      </div>
                      <div className="text-xs mt-1">
                        <span className="text-slate-400">Ch:</span> <span className="font-medium text-slate-700">{ride.driver}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {ride.price}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ride.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rides;
