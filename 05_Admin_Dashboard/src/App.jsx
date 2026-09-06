import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Clients from './pages/Clients';
import Rides from './pages/Rides';
import Settings from './pages/Settings';
import VehiclesVerification from './pages/VehiclesVerification';
import Quotes from './pages/Quotes';
import useAuthStore from './store/useAuthStore';

import LiveMap from './pages/LiveMap';
import Urgent from './pages/Urgent';
import Events from './pages/Events';
import Medical from './pages/Medical';
import Funeral from './pages/Funeral';
import Freight from './pages/Freight';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Cities from './pages/Cities';
import AuditLog from './pages/AuditLog';
import Support from './pages/Support';
import Setup from './pages/Setup';
import Infrastructures from './pages/Infrastructures';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="live-map" element={<LiveMap />} />
          <Route path="clients" element={<Clients />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="vehicles-verification" element={<VehiclesVerification />} />
          <Route path="rides" element={<Rides />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="urgent" element={<Urgent />} />
          <Route path="events" element={<Events />} />
          <Route path="medical" element={<Medical />} />
          <Route path="funeral" element={<Funeral />} />
          <Route path="freight" element={<Freight />} />
          <Route path="support" element={<Support />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="cities" element={<Cities />} />
          <Route path="infrastructures" element={<Infrastructures />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
