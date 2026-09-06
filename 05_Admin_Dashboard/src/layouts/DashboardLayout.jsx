import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Map, 
  CreditCard, 
  MessageSquare, 
  Settings,
  LogOut,
  Bell,
  CheckCircle,
  FileText,
  AlertTriangle,
  Calendar,
  Activity,
  Archive,
  Truck,
  Building,
  ShieldAlert,
  BarChart3,
  MapPin
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import logo from '../assets/logo.png';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link 
    to={path} 
    className={`flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors ${
      active 
        ? 'bg-primary text-primary-foreground' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const DashboardLayout = () => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Nouveau chauffeur', text: "Jean Dupont s'est inscrit et attend validation.", time: 'Il y a 5 min' },
    { id: 2, title: 'Course urgente', text: 'Une course médicale a été demandée.', time: 'Il y a 10 min' },
    { id: 3, title: 'Paiement reçu', text: 'Paiement de 15,000 XOF validé.', time: 'Il y a 1h' }
  ];

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
    { icon: Map, label: 'Carte en direct', path: '/live-map' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Car, label: 'Prestataires', path: '/drivers' },
    { icon: CheckCircle, label: 'Validation Véhicules', path: '/vehicles-verification' },
    { icon: FileText, label: 'Demandes & Courses', path: '/rides' },
    { icon: AlertTriangle, label: 'Urgences', path: '/urgent' },
    { icon: Calendar, label: 'Événements', path: '/events' },
    { icon: Activity, label: 'Transport Médical', path: '/medical' },
    { icon: Archive, label: 'Transport Funéraire', path: '/funeral' },
    { icon: Truck, label: 'Marchandises', path: '/freight' },
    { icon: MessageSquare, label: 'Support & Réclamations', path: '/support' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: CreditCard, label: 'Paiements', path: '/payments' },
    { icon: BarChart3, label: 'Rapports', path: '/reports' },
    { icon: Building, label: 'Villes', path: '/cities' },
    { icon: MapPin, label: 'Infrastructures', path: '/infrastructures' },
    { icon: ShieldAlert, label: 'Audit Log', path: '/audit' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center px-6 border-b border-slate-200">
          <img src={logo} alt="Nasuba Voyage" className="h-8 object-contain" />
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu Principal</div>
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path}
              icon={item.icon} 
              label={item.label} 
              path={item.path} 
              active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white border-b border-slate-200">
          <h1 className="text-xl font-semibold capitalize">
            {navItems.find(item => item.path === location.pathname)?.label || 'Administration'}
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                    <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setShowNotifications(false)}>Tout marquer comme lu</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                        <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{notif.text}</p>
                        <p className="text-xs text-slate-400 mt-2">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                    <Link to="/notifications" className="text-sm text-primary font-medium" onClick={() => setShowNotifications(false)}>
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium">{user?.email || 'Admin'}</p>
                <p className="text-slate-500 text-xs font-bold">{useAuthStore.getState().adminData?.role || 'Administrateur'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
