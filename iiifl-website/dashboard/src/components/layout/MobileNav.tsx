import { X, Home, PieChart, BarChart3, Wallet, Settings, LogOut, List } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

const MobileNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="relative w-64 bg-card border-r border-border shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-xl font-bold text-primary tracking-tighter">iiifl</div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem to="/dashboard" icon={<Home size={20} />} label="Dashboard" onClick={onClose} end />
          <NavItem to="/dashboard/orders" icon={<List size={20} />} label="Orders" onClick={onClose} />
          <NavItem to="/dashboard/portfolio" icon={<PieChart size={20} />} label="Portfolio" onClick={onClose} />
          <NavItem to="/dashboard/market" icon={<BarChart3 size={20} />} label="Market" onClick={onClose} />
          <NavItem to="/dashboard/funds" icon={<Wallet size={20} />} label="Funds" onClick={onClose} />
          <NavItem to="/dashboard/settings" icon={<Settings size={20} />} label="Settings" onClick={onClose} />
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50/10 rounded-md transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, to, onClick, end }: any) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
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

export default MobileNav;
