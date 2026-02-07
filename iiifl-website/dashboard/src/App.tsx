import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";
import LandingLayout from "./components/layout/LandingLayout";
import AdminSidebar from "./components/admin/AdminSidebar";
import AssetAllocation from "./components/dashboard/AssetAllocation";
import PerformanceChart from "./components/dashboard/PerformanceChart";
import PortfolioSummary from "./components/dashboard/PortfolioSummary";
import RecentTransactions from "./components/dashboard/RecentTransactions";
import Positions from "./components/dashboard/Positions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Lazy Load Pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Landing = lazy(() => import("./pages/Landing"));
const Products = lazy(() => import("./pages/landing/Products"));
const Pricing = lazy(() => import("./pages/landing/Pricing"));
const Learn = lazy(() => import("./pages/landing/Learn"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Market = lazy(() => import("./pages/Market"));
const Funds = lazy(() => import("./pages/Funds"));
const Settings = lazy(() => import("./pages/Settings"));
const Orders = lazy(() => import("./pages/Orders"));
const Options = lazy(() => import("./pages/Options"));
const StockDetail = lazy(() => import("./pages/StockDetail"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Loading Component
const Loading = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh] text-muted-foreground">
    Loading...
  </div>
);

// 1. Main Layout for User Dashboard
const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-300 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
        <Header />
        <main className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto pb-20 md:pb-8">
           <Suspense fallback={<Loading />}>
             <Outlet />
           </Suspense>
        </main>
        <BottomNav />
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
      
      <Tabs defaultValue="holdings" className="w-full">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="positions">Day Positions</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings" className="space-y-4">
            <PortfolioSummary />
            <div className="grid gap-4 md:grid-cols-7">
                <PerformanceChart />
                <AssetAllocation />
            </div>
            <div className="grid gap-4 md:grid-cols-7">
                <RecentTransactions />
            </div>
        </TabsContent>
        <TabsContent value="positions">
            <Positions />
        </TabsContent>
      </Tabs>
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
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes with Landing Layout */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/learn" element={<Learn />} />
        </Route>

        <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<Orders />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="market" element={<Market />} />
          <Route path="options" element={<Options />} />
          <Route path="stock/:symbol" element={<StockDetail />} />
          <Route path="funds" element={<Funds />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
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