import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Ban, CheckCircle, Eye, Loader } from 'lucide-react';
import { logAdminAction } from '../utils/auditLogger';
import useAuthStore from '../store/useAuthStore';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuthStore();
  
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Fallbacks for UI if fields are missing
        name: doc.data().name || `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Client Inconnu',
        phone: doc.data().phone || 'Non renseigné',
        city: doc.data().city || 'Non renseignée',
        joined: doc.data().createdAt?.toDate().toLocaleDateString('fr-FR') || 'Date inconnue',
        requests: doc.data().requestsCount || 0,
        status: doc.data().status || 'Actif',
        avatar: doc.data().photoURL || `https://ui-avatars.com/api/?name=${doc.data().name || 'Client'}`
      }));
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des clients:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSuspend = async (client) => {
    if (!hasPermission('SUSPEND_USERS')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir suspendre ${client.name} ?`)) {
      try {
        await updateDoc(doc(db, 'users', client.id), { status: 'Suspendu' });
        await logAdminAction('SUSPEND_USER', `userId_${client.id}`, 'Utilisateur suspendu avec succès');
      } catch (error) {
        console.error("Erreur de suspension:", error);
        alert("Une erreur s'est produite lors de la suspension.");
      }
    }
  };

  const handleReactivate = async (client) => {
    if (!hasPermission('SUSPEND_USERS')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir réactiver ${client.name} ?`)) {
      try {
        await updateDoc(doc(db, 'users', client.id), { status: 'Actif' });
        await logAdminAction('REACTIVATE_USER', `userId_${client.id}`, 'Utilisateur réactivé avec succès');
      } catch (error) {
        console.error("Erreur de réactivation:", error);
        alert("Une erreur s'est produite lors de la réactivation.");
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un client (nom, téléphone)..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
          <Filter size={20} />
          <span>Filtrer</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Contact & Ville</th>
                <th className="px-6 py-4 font-medium">Inscription</th>
                <th className="px-6 py-4 font-medium text-center">Demandes</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="animate-spin mb-2" size={24} />
                      <p>Chargement des clients...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="font-medium text-slate-900">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{client.phone}</div>
                      <div className="text-sm text-slate-500">{client.city}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{client.joined}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">
                        {client.requests}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'Actif' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors" title="Consulter Profil">
                          <Eye size={18} />
                        </button>
                        {client.status === 'Actif' ? (
                          <button onClick={() => handleSuspend(client)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Suspendre">
                            <Ban size={18} />
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(client)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Réactiver">
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
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

export default Clients;
