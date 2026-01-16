import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import LandingLayout from "./components/layout/LandingLayout";
import AdminSidebar from "./components/admin/AdminSidebar";
import AssetAllocation from "./components/dashboard/AssetAllocation";
import PerformanceChart from "./components/dashboard/PerformanceChart";
import PortfolioSummary from "./components/dashboard/PortfolioSummary";
import RecentTransactions from "./components/dashboard/RecentTransactions";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Products from "./pages/landing/Products";
import Pricing from "./pages/landing/Pricing";
import Learn from "./pages/landing/Learn";
import Portfolio from "./pages/Portfolio";
import Market from "./pages/Market";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { FundsPage, SettingsPage } from "./pages/PlaceholderPages";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// 1. Main Layout for User Dashboard
const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header />
        <main className="p-6 md:p-8 space-y-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

// 2. The Home View (Widgets)
const DashboardHome = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your investments and performance.</p>
        </div>
      </div>
      <PortfolioSummary />
      <div className="grid gap-4 md:grid-cols-7">
        <PerformanceChart />
        <AssetAllocation />
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <RecentTransactions />
      </div>
    </>
  );
};

// 3. Admin Layout
const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
         <Outlet />
      </div>
    </div>
  );
};

// 4. Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: any }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// 5. Admin Route Wrapper
const AdminRoute = ({ children }: { children: any }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// 6. Router Logic
const AppRouter = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public Routes with Landing Layout */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Landing />} />
        <Route path="/products" element={<Products />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/learn" element={<Learn />} />
      </Route>

      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="market" element={<Market />} />
        <Route path="funds" element={<FundsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="iiifl-ui-theme">
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;