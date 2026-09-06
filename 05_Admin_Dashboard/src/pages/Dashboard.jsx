import React, { useState, useEffect } from 'react';
import { Users, Car, Map, DollarSign, TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#F56565'];

const StatCard = ({ title, value, icon: Icon, trend, colorClass, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-${colorClass.replace('bg-', '')}`}>
        <Icon size={24} />
      </div>
    </div>
    {trend !== undefined && (
      <div className="mt-4 flex items-center text-sm">
        <TrendingUp size={16} className={`${trend >= 0 ? 'text-emerald-500' : 'text-red-500'} mr-1`} />
        <span className={`${trend >= 0 ? 'text-emerald-500' : 'text-red-500'} font-medium`}>{trend > 0 ? '+' : ''}{trend}%</span>
        <span className="text-slate-400 ml-2">{subtitle || 'depuis le mois dernier'}</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
    pendingRides: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
  });

  const [servicesData, setServicesData] = useState([
    { name: 'Véhicule urgence', value: 0 },
    { name: 'Transport médical', value: 0 },
    { name: 'Transport marchandises', value: 0 },
    { name: 'Transport funéraire', value: 0 },
    { name: 'Événement', value: 0 },
    { name: 'Taxi', value: 0 },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { name: 'Lun', courses: 0 },
    { name: 'Mar', courses: 0 },
    { name: 'Mer', courses: 0 },
    { name: 'Jeu', courses: 0 },
    { name: 'Ven', courses: 0 },
    { name: 'Sam', courses: 0 },
    { name: 'Dim', courses: 0 },
  ]);

  useEffect(() => {
    // 1. Fetch Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'Actif' || !u.status).length
      }));
    });

    // 2. Fetch Drivers
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      const drivers = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({
        ...prev,
        totalDrivers: drivers.length,
        onlineDrivers: drivers.filter(d => d.isOnline).length
      }));
    });

    // 3. Fetch Rides
    const unsubRides = onSnapshot(collection(db, 'rides'), (snapshot) => {
      const rides = snapshot.docs.map(doc => doc.data());
      
      const pending = rides.filter(r => r.status === 'pending' || r.status === 'en attente').length;
      const active = rides.filter(r => r.status === 'active' || r.status === 'en cours').length;
      const completed = rides.filter(r => r.status === 'completed' || r.status === 'terminée').length;
      const cancelled = rides.filter(r => r.status === 'cancelled' || r.status === 'annulée').length;

      setStats(prev => ({
        ...prev,
        pendingRides: pending,
        activeRides: active,
        completedRides: completed,
        cancelledRides: cancelled
      }));

      // Distribution by service (basic estimation based on service name)
      const serviceCounts = {
        'Véhicule urgence': 0,
        'Transport médical': 0,
        'Transport marchandises': 0,
        'Transport funéraire': 0,
        'Événement': 0,
        'Taxi': 0,
      };

      rides.forEach(r => {
        if (r.serviceType) {
          // matching keys approximately
          const type = Object.keys(serviceCounts).find(k => k.toLowerCase().includes(r.serviceType.toLowerCase()));
          if (type) serviceCounts[type]++;
          else serviceCounts['Taxi']++; // default
        }
      });

      // Set Services Data regardless of whether there's data or not
      setServicesData(Object.keys(serviceCounts).map(key => ({
        name: key,
        value: serviceCounts[key]
      })));

      // Calculate Weekly Performance based on rides creation date
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const currentWeekData = { 'Lun': 0, 'Mar': 0, 'Mer': 0, 'Jeu': 0, 'Ven': 0, 'Sam': 0, 'Dim': 0 };
      
      const now = new Date();
      // Only count rides from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      rides.forEach(r => {
        let date;
        if (r.createdAt && r.createdAt.toDate) {
          date = r.createdAt.toDate();
        } else if (r.createdAt) {
          date = new Date(r.createdAt);
        }

        if (date && date >= sevenDaysAgo) {
          const dayName = days[date.getDay()];
          if (currentWeekData[dayName] !== undefined) {
            currentWeekData[dayName]++;
          }
        }
      });

      setPerformanceData([
        { name: 'Lun', courses: currentWeekData['Lun'] },
        { name: 'Mar', courses: currentWeekData['Mar'] },
        { name: 'Mer', courses: currentWeekData['Mer'] },
        { name: 'Jeu', courses: currentWeekData['Jeu'] },
        { name: 'Ven', courses: currentWeekData['Ven'] },
        { name: 'Sam', courses: currentWeekData['Sam'] },
        { name: 'Dim', courses: currentWeekData['Dim'] },
      ]);
    });

    return () => {
      unsubUsers();
      unsubDrivers();
      unsubRides();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* SECTION: UTILISATEURS & PRESTATAIRES */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Utilisateurs & Prestataires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Clients" value={stats.totalUsers} icon={Users} colorClass="bg-blue-500 text-blue-500" />
          <StatCard title="Clients Actifs" value={stats.activeUsers} icon={CheckCircle2} colorClass="bg-emerald-500 text-emerald-500" />
          <StatCard title="Total Prestataires" value={stats.totalDrivers} icon={Car} colorClass="bg-orange-500 text-orange-500" />
          <StatCard title="Prestataires en Ligne" value={stats.onlineDrivers} icon={Clock} colorClass="bg-green-500 text-green-500" />
        </div>
      </div>

      {/* SECTION: ACTIVITÉ (COURSES & MISSIONS) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Activité Récente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Demandes en attente" value={stats.pendingRides} icon={Clock} colorClass="bg-amber-500 text-amber-500" />
          <StatCard title="Courses en cours" value={stats.activeRides} icon={Map} colorClass="bg-blue-500 text-blue-500" />
          <StatCard title="Courses terminées" value={stats.completedRides} icon={CheckCircle2} colorClass="bg-emerald-500 text-emerald-500" />
          <StatCard title="Annulations" value={stats.cancelledRides} icon={XCircle} colorClass="bg-red-500 text-red-500" />
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Performance Hebdomadaire (Estimation)</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F62FE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F62FE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip />
                <Area type="monotone" dataKey="courses" stroke="#0F62FE" strokeWidth={3} fillOpacity={1} fill="url(#colorCourses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Services */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition par Service</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
