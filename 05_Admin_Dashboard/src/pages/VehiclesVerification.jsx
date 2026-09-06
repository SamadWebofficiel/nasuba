import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, AlertTriangle, Loader } from 'lucide-react';
import { logAdminAction } from '../utils/auditLogger';
import useAuthStore from '../store/useAuthStore';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';

const VehiclesVerification = () => {
  const { hasPermission } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'drivers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehiclesData = snapshot.docs
        // Only include drivers that actually registered a vehicle
        .filter(doc => doc.data().vehicleType || doc.data().vehicleBrand)
        .map(doc => {
          const data = doc.data();
          let dateStr = 'Date inconnue';
          if (data.createdAt && data.createdAt.toDate) {
            dateStr = data.createdAt.toDate().toLocaleDateString('fr-FR');
          } else if (data.createdAt) {
            dateStr = new Date(data.createdAt).toLocaleDateString('fr-FR');
          }
          return {
            id: doc.id,
            driver: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Non spécifié',
            type: data.vehicleType || 'Non spécifié',
            plate: data.vehiclePlate || 'Non spécifiée',
            status: data.vehicleStatus || data.validationStatus === 'Validé' ? 'approved' : (data.validationStatus === 'Suspendu' ? 'rejected' : 'pending'),
            date: dateStr,
            documents: data.driverLicenseFrontUrl ? ['Permis'] : [],
            ...data
          };
        });
      setVehicles(vehiclesData);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des véhicules:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (id) => {
    if (!hasPermission('MANAGE_VEHICLES')) {
      alert("Action non autorisée.");
      return;
    }
    if (window.confirm('Confirmer la validation de ce véhicule ?')) {
      try {
        await updateDoc(doc(db, 'drivers', id), { vehicleStatus: 'approved' });
        await logAdminAction('VALIDATE_VEHICLE', `vehicleId_${id}`, 'Véhicule validé');
      } catch (error) {
        console.error("Erreur de validation:", error);
        alert("Erreur lors de la validation.");
      }
    }
  };

  const handleReject = async (id) => {
    if (!hasPermission('MANAGE_VEHICLES')) {
      alert("Action non autorisée.");
      return;
    }
    const reason = window.prompt("Veuillez indiquer la raison du refus (sera envoyé au prestataire) :");
    if (reason !== null) {
      try {
        await updateDoc(doc(db, 'drivers', id), { 
          vehicleStatus: 'rejected',
          rejectReason: reason 
        });
        await logAdminAction('REJECT_VEHICLE', `vehicleId_${id}`, `Véhicule rejeté : ${reason}`);
      } catch (error) {
        console.error("Erreur de rejet:", error);
        alert("Erreur lors du rejet du véhicule.");
      }
    }
  };

  const pendingCount = vehicles.filter(v => v.status === 'pending').length;

  const filteredVehicles = vehicles.filter(v => 
    v.driver.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Validation des Véhicules Spéciaux</h2>
          <p className="text-slate-500">Examinez et validez les demandes pour les catégories réglementées (Médical, Funéraire, Poids Lourds).</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">En attente de validation</p>
            <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher (Chauffeur, Plaque)..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Chauffeur</th>
                <th className="px-6 py-4 font-semibold">Type / Service</th>
                <th className="px-6 py-4 font-semibold">Immatriculation</th>
                <th className="px-6 py-4 font-semibold">Documents</th>
                <th className="px-6 py-4 font-semibold text-center">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader className="animate-spin mb-2" size={24} />
                      <p>Chargement des véhicules...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Aucun véhicule trouvé.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{vehicle.date}</td>
                    <td className="px-6 py-4">{vehicle.driver}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{vehicle.plate}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {vehicle.documents.length > 0 ? vehicle.documents.map((doc, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                            {doc}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-400 italic">Aucun document</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          En attente
                        </span>
                      )}
                      {vehicle.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Validé
                        </span>
                      )}
                      {vehicle.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/50">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          Refusé
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors" title="Voir les documents">
                          <Eye size={18} />
                        </button>
                        {vehicle.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(vehicle.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Valider">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleReject(vehicle.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Refuser">
                              <XCircle size={18} />
                            </button>
                          </>
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

export default VehiclesVerification;
