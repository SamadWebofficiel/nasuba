"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (!db) return;

        // Fetch products stats
        const productsSnapshot = await getDocs(collection(db, "products"));
        let totalProd = 0;
        let availableProd = 0;
        let outOfStock = 0;
        
        productsSnapshot.forEach(doc => {
          totalProd++;
          const data = doc.data();
          if (data.isAvailable && data.stock > 0) availableProd++;
          if (!data.isAvailable || data.stock <= 0) outOfStock++;
        });

        // Fetch recent products
        const productsQuery = query(collection(db, "products"), limit(5));
        // Idéalement on ferait orderBy("createdAt", "desc"), mais ça nécessite un index. On prend juste les 5 premiers.
        const recentProdSnap = await getDocs(productsQuery);
        const fetchedRecentProducts = [];
        recentProdSnap.forEach(doc => {
          fetchedRecentProducts.push({ id: doc.id, ...doc.data() });
        });

        // Fetch orders stats
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        let totalOrd = 0;
        let pendingOrd = 0;
        
        ordersSnapshot.forEach(doc => {
          totalOrd++;
          const data = doc.data();
          const pendingStatuses = ["Nouvelle", "Confirmée", "En préparation", "Prête"];
          if (pendingStatuses.includes(data.status)) pendingOrd++;
        });

        // Fetch recent orders
        const ordersQuery = query(collection(db, "orders"), limit(5));
        const recentOrdSnap = await getDocs(ordersQuery);
        const fetchedRecentOrders = [];
        recentOrdSnap.forEach(doc => {
          fetchedRecentOrders.push({ id: doc.id, ...doc.data() });
        });

        setStats({
          totalProducts: totalProd,
          availableProducts: availableProd,
          outOfStockProducts: outOfStock,
          totalOrders: totalOrd,
          pendingOrders: pendingOrd
        });
        
        setRecentProducts(fetchedRecentProducts);
        setRecentOrders(fetchedRecentOrders);

      } catch (error) {
        console.error("Erreur chargement dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <Link href="/admin/products/new" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Ajouter un parfum
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
          <p className="text-sm text-foreground/50 mb-1">Total Produits</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
          <p className="text-sm text-foreground/50 mb-1">Produits Disponibles</p>
          <p className="text-3xl font-bold text-green-600">{stats.availableProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
          <p className="text-sm text-foreground/50 mb-1">Rupture de Stock</p>
          <p className="text-3xl font-bold text-red-500">{stats.outOfStockProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
          <p className="text-sm text-foreground/50 mb-1">Commandes</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-black/5 shadow-sm">
          <p className="text-sm text-foreground/50 mb-1">Commandes en attente</p>
          <p className="text-3xl font-bold text-amber-500">{stats.pendingOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-black/5 flex justify-between items-center">
            <h2 className="font-bold text-foreground">Commandes Récentes</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="p-0 flex-1">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-foreground/50 text-sm">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {recentOrders.map(order => (
                  <li key={order.id} className="p-4 hover:bg-black/5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-foreground">{order.customerName || order.clientName}</p>
                      <p className="text-xs text-foreground/50">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : "Date inconnue"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary">{order.total?.toLocaleString('fr-FR')} F</p>
                      <span className="text-[10px] uppercase font-bold bg-black/5 text-foreground/70 px-2 py-1 rounded">
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-black/5 flex justify-between items-center">
            <h2 className="font-bold text-foreground">Produits Récemment Ajoutés</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="p-0 flex-1">
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-foreground/50 text-sm">
                Aucun produit ajouté pour le moment.
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {recentProducts.map(prod => (
                  <li key={prod.id} className="p-4 hover:bg-black/5 flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-black/5">
                      {prod.images && prod.images.length > 0 ? (
                        <Image src={prod.images[0]} alt={prod.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400">Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground line-clamp-1">{prod.name}</p>
                      <p className="text-xs text-foreground/50">{prod.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">{prod.price > 0 ? `${prod.price.toLocaleString('fr-FR')} F` : '-'}</p>
                      <p className={`text-xs ${prod.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {prod.stock > 0 ? `${prod.stock} en stock` : 'Rupture'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
