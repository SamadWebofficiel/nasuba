"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, runTransaction } from "firebase/firestore";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      if (!db) return;
      setLoading(true);
      const snapshot = await getDocs(collection(db, "orders"));
      const ords = [];
      snapshot.forEach(doc => {
        ords.push({ id: doc.id, ...doc.data() });
      });
      
      ords.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });

      setOrders(ords);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des commandes.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      if (newStatus === "Annulée") {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ? Le stock des articles sera automatiquement restitué.")) return;
      }
      
      setUpdating(true);
      if (newStatus === "Annulée") {
        await runTransaction(db, async (transaction) => {
          const orderRef = doc(db, "orders", id);
          const orderDoc = await transaction.get(orderRef);
          if (!orderDoc.exists()) throw new Error("Commande introuvable");
          
          const order = orderDoc.data();
          if (order.status === "Annulée") throw new Error("Commande déjà annulée");

          // Restituer les stocks
          const items = order.products || order.items || [];
          if (items.length > 0) {
            for (const item of items) {
              const pRef = doc(db, "products", item.productId || item.id);
              const pDoc = await transaction.get(pRef);
              if (pDoc.exists()) {
                const currentStock = pDoc.data().stock || 0;
                transaction.update(pRef, { stock: currentStock + (item.quantity || item.quantite) });
              }
            }
          }
          
          transaction.update(orderRef, { status: "Annulée", updatedAt: new Date() });
        });
      } else {
        const orderRef = doc(db, "orders", id);
        await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      }
      
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Nouvelle": return "bg-blue-100 text-blue-700";
      case "Confirmée": return "bg-purple-100 text-purple-700";
      case "En préparation": return "bg-amber-100 text-amber-700";
      case "Prête": return "bg-orange-100 text-orange-700";
      case "Livrée": return "bg-green-100 text-green-700";
      case "Annulée": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders.filter(o => {
    const searchMatch = 
      (o.orderNumber || o.id).toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.customerName || o.clientName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "Tous" || o.status === statusFilter;
    return searchMatch && statusMatch;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Gestion des Commandes</h1>
        
        {/* Filtres et Recherche */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Rechercher (Nom ou N°)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Nouvelle">Nouvelle</option>
            <option value="Confirmée">Confirmée</option>
            <option value="En préparation">En préparation</option>
            <option value="Prête">Prête</option>
            <option value="Livrée">Livrée</option>
            <option value="Annulée">Annulée</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 shrink-0">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Liste des commandes */}
        <div className="lg:w-1/3 flex flex-col bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden h-full">
          <div className="p-4 border-b border-black/5 bg-gray-50/50 shrink-0 flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Historique</h2>
            <span className="text-xs bg-black/10 px-2 py-1 rounded font-bold">{filteredOrders.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            {filteredOrders.length === 0 ? (
              <p className="p-8 text-center text-foreground/50">Aucune commande trouvée.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {filteredOrders.map(order => (
                  <li 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      selectedOrder?.id === order.id 
                        ? "bg-primary/5 border-primary" 
                        : "hover:bg-black/5 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm">#{order.orderNumber || order.id.slice(0,6).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium line-clamp-1">{order.customerName || order.clientName}</span>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">{order.total?.toLocaleString('fr-FR')} F</span>
                    </div>
                    <p className="text-xs text-foreground/50 mt-1">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
                      }) : "Date inconnue"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Détails de la commande */}
        <div className="lg:w-2/3 flex flex-col bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden h-full">
          {selectedOrder ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-black/5 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0 bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold">Commande #{selectedOrder.orderNumber || selectedOrder.id.slice(0,6).toUpperCase()}</h2>
                  <p className="text-sm text-foreground/60">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleString('fr-FR') : ""}
                  </p>
                </div>
                
                {/* Actions Administratives */}
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === "Nouvelle" && (
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, "Confirmée")} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">Confirmer</button>
                  )}
                  {selectedOrder.status === "Confirmée" && (
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, "En préparation")} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">Préparer</button>
                  )}
                  {selectedOrder.status === "En préparation" && (
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, "Prête")} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">Marquer Prête</button>
                  )}
                  {selectedOrder.status === "Prête" && (
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, "Livrée")} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">Livrer</button>
                  )}
                  {selectedOrder.status !== "Annulée" && selectedOrder.status !== "Livrée" && (
                    <button disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, "Annulée")} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">Annuler</button>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Infos Client */}
                  <div>
                    <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider mb-4">Informations Client</h3>
                    <div className="space-y-3 text-sm">
                      <p><span className="font-medium inline-block w-24">Nom :</span> {selectedOrder.customerName || selectedOrder.clientName}</p>
                      <p>
                        <span className="font-medium inline-block w-24">Téléphone :</span> 
                        <a href={`tel:${selectedOrder.customerPhone || selectedOrder.clientPhone}`} className="text-primary hover:underline">{selectedOrder.customerPhone || selectedOrder.clientPhone}</a>
                      </p>
                      <p><span className="font-medium inline-block w-24">Ville :</span> {selectedOrder.city}</p>
                      {selectedOrder.neighborhood && <p><span className="font-medium inline-block w-24">Quartier :</span> {selectedOrder.neighborhood}</p>}
                    </div>
                  </div>

                  {/* Infos Livraison */}
                  <div>
                    <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider mb-4">Détails de Réception</h3>
                    <div className="space-y-3 text-sm">
                      <p><span className="font-medium inline-block w-24">Mode :</span> <span className="font-bold">{selectedOrder.deliveryMethod || selectedOrder.deliveryMode}</span></p>
                      {(selectedOrder.customerMessage || selectedOrder.message) && (
                        <div>
                          <span className="font-medium block mb-1">Message du client :</span>
                          <p className="bg-gray-50 p-3 rounded-lg border border-black/5 text-foreground/80 italic">{selectedOrder.customerMessage || selectedOrder.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider mb-4">Articles Commandés</h3>
                  <div className="border border-black/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-black/5">
                        <tr>
                          <th className="p-3 font-medium text-foreground/70">Produit</th>
                          <th className="p-3 font-medium text-foreground/70 text-center">Qté</th>
                          <th className="p-3 font-medium text-foreground/70 text-right">Prix Unitaire</th>
                          <th className="p-3 font-medium text-foreground/70 text-right">Sous-total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {(selectedOrder.products || selectedOrder.items || []).map((item, index) => (
                          <tr key={index}>
                            <td className="p-3 font-medium">{item.productName || item.name || item.nom}</td>
                            <td className="p-3 text-center">{item.quantity || item.quantite}</td>
                            <td className="p-3 text-right">{(item.price || item.prix)?.toLocaleString('fr-FR')} F</td>
                            <td className="p-3 text-right font-bold">{(item.subtotal || ((item.price || item.prix) * (item.quantity || item.quantite)))?.toLocaleString('fr-FR')} F</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-black/10">
                        <tr>
                          <td colSpan="3" className="p-3 text-right text-foreground/70">Sous-total produits</td>
                          <td className="p-3 text-right font-semibold">{selectedOrder.subtotal?.toLocaleString('fr-FR') || selectedOrder.total?.toLocaleString('fr-FR')} F</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="p-3 text-right text-foreground/70">Frais de livraison</td>
                          <td className="p-3 text-right font-semibold">{selectedOrder.deliveryFee != null ? `${selectedOrder.deliveryFee.toLocaleString('fr-FR')} F` : 'Non définis'}</td>
                        </tr>
                        <tr className="font-bold text-base">
                          <td colSpan="3" className="p-4 text-right">TOTAL</td>
                          <td className="p-4 text-right text-primary">{selectedOrder.total?.toLocaleString('fr-FR')} F</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                   <a 
                    href={`https://wa.me/${(selectedOrder.customerPhone || selectedOrder.clientPhone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Contacter sur WhatsApp
                  </a>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/40 p-8 h-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 15.75h3.75M18 19.5h-12a2.25 2.25 0 01-2.25-2.25V6A2.25 2.25 0 016 3.75h1.5m9 0h1.5A2.25 2.25 0 0120.25 6v11.25A2.25 2.25 0 0118 19.5zM15 3.75a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5h6v-1.5z" />
              </svg>
              <p>Sélectionnez une commande pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
