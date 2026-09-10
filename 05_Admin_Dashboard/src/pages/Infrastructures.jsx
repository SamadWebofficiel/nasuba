import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';

function Infrastructures() {
  const [infrastructures, setInfrastructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInfra, setNewInfra] = useState({ name: '', category: 'Santé', city: 'Parakou', address: '', lat: '', lng: '', icon: '🏥' });

  const categories = [
    { name: 'Santé', icon: '🏥' },
    { name: 'Sécurité', icon: '🚓' },
    { name: 'Automobile', icon: '⛽' },
    { name: 'Transport', icon: '🚌' },
    { name: 'Hébergement', icon: '🏨' },
    { name: 'Restauration', icon: '🍽️' },
    { name: 'Services', icon: '🏦' },
    { name: 'Commerce', icon: '🛒' },
  ];

  const fetchInfrastructures = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'infrastructures'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInfrastructures(data);
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInfrastructures();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette infrastructure ?")) {
      await deleteDoc(doc(db, 'infrastructures', id));
      // In a real app, log to audit_logs here
      fetchInfrastructures();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        name: newInfra.name,
        category: newInfra.category,
        icon: newInfra.icon,
        city: newInfra.city,
        address: newInfra.address,
        position: { lat: parseFloat(newInfra.lat), lng: parseFloat(newInfra.lng) },
        verified: true,
        source: 'Admin',
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'infrastructures'), dataToSave);
      // In a real app, log to audit_logs here
      setIsModalOpen(false);
      setNewInfra({ name: '', category: 'Santé', city: 'Parakou', address: '', lat: '', lng: '', icon: '🏥' });
      fetchInfrastructures();
    } catch (error) {
      console.error("Erreur d'ajout:", error);
    }
  };

  const handleCategoryChange = (catName) => {
    const cat = categories.find(c => c.name === catName);
    setNewInfra({ ...newInfra, category: catName, icon: cat.icon });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Infrastructures (Nord Bénin)</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          + Ajouter un Lieu
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des données...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {infrastructures.map((infra) => (
                <tr key={infra.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {infra.icon} {infra.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{infra.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{infra.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{infra.address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {infra.source === 'OSM' ? (
                      <span className="text-green-600 font-bold">OSM</span>
                    ) : (
                      <span className="text-purple-600 font-bold">Admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(infra.id)} className="text-red-600 hover:text-red-900">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {infrastructures.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Aucune infrastructure trouvée. Lancez le script Overpass API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une infrastructure</h2>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input type="text" required value={newInfra.name} onChange={e => setNewInfra({...newInfra, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select value={newInfra.category} onChange={e => handleCategoryChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    {categories.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ville</label>
                  <input type="text" required value={newInfra.city} onChange={e => setNewInfra({...newInfra, city: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input type="text" value={newInfra.address} onChange={e => setNewInfra({...newInfra, address: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input type="number" step="any" required value={newInfra.lat} onChange={e => setNewInfra({...newInfra, lat: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input type="number" step="any" required value={newInfra.lng} onChange={e => setNewInfra({...newInfra, lng: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Infrastructures;
