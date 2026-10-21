import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Landing from '@/pages/Landing';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Rates from '@/pages/Rates';
import Calculator from '@/pages/Calculator';
import Calculations from '@/pages/Calculations';
import Subscription from '@/pages/Subscription';
import Settings from '@/pages/Settings';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminRates from '@/pages/AdminRates';
import AdminProducts from '@/pages/AdminProducts';
import AdminPorts from '@/pages/AdminPorts';
import AdminUsers from '@/pages/AdminUsers';
import { ToastProvider } from '@/components/ui/toast';

function RequireAuth() {
  const token = localStorage.getItem('freshmcalc_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const userRaw = localStorage.getItem('freshmcalc_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/rates/history" element={<Rates />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/calculations" element={<Calculations />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/settings" element={<Settings />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rates" element={<AdminRates />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/ports" element={<AdminPorts />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </ToastProvider>
  );
}
