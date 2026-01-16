import { Home, PieChart, BarChart3, Wallet, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card z-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">iiifl</h1>
        <p className="text-xs text-muted-foreground">Pro Trading</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
        <NavItem to="/portfolio" icon={<PieChart size={20} />} label="Portfolio" />
        <NavItem to="/market" icon={<BarChart3 size={20} />} label="Market" />
        <NavItem to="/funds" icon={<Wallet size={20} />} label="Funds" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, to }: { icon: any, label: string, to: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-md transition-all ${
      isActive 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`}
  >
    {icon}
    {label}
  </NavLink>
);

export default Sidebar;
