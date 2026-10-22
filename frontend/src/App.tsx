import * as React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Toaster } from '@/components/ui/toaster';
import { LogoMark } from '@/components/common/Logo';

// Route-level code splitting — each page loads on demand (fast first paint,
// especially on mobile networks). Recharts/jsPDF only download where used.
const Landing = React.lazy(() => import('@/pages/Landing'));
const Pricing = React.lazy(() => import('@/pages/Pricing'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Rates = React.lazy(() => import('@/pages/Rates'));
const Calculator = React.lazy(() => import('@/pages/Calculator'));
const Calculations = React.lazy(() => import('@/pages/Calculations'));
const Subscription = React.lazy(() => import('@/pages/Subscription'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));
const AdminRates = React.lazy(() => import('@/pages/AdminRates'));
const AdminProducts = React.lazy(() => import('@/pages/AdminProducts'));
const AdminPorts = React.lazy(() => import('@/pages/AdminPorts'));
const AdminUsers = React.lazy(() => import('@/pages/AdminUsers'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
// Deep links used by the installed app / native shells.
const GetApp = React.lazy(() => import('@/pages/GetApp'));

function PageLoader() {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 py-16" role="status" aria-label="Loading page">
      <span className="animate-pulse">
        <LogoMark className="h-14 w-14 rounded-2xl [&>svg]:h-7 [&>svg]:w-7" />
      </span>
      <p className="text-sm font-semibold text-muted-foreground">Loading fresh rates…</p>
    </div>
  );
}

/** Scrolls to top on navigation, or to the #hash anchor when present. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  React.useEffect(() => {
    if (hash) {
      // Wait a tick for lazy pages to mount before scrolling to the anchor.
      const t = window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function RequireAuth() {
  const token = localStorage.getItem('freshmcalc_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const userRaw = localStorage.getItem('freshmcalc_user');
  let user: any = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public marketing site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/get-app" element={<GetApp />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated app shell */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
      <Toaster />
    </>
  );
}
