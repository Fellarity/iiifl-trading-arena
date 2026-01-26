import { Home, BarChart3, PieChart, List, Layers } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex justify-around items-center px-2 z-40 pb-safe">
      <NavItem to="/dashboard" icon={<Home size={20} />} label="Home" end />
      <NavItem to="/dashboard/market" icon={<BarChart3 size={20} />} label="Market" />
      <NavItem to="/dashboard/portfolio" icon={<PieChart size={20} />} label="Portfolio" />
      <NavItem to="/dashboard/orders" icon={<List size={20} />} label="Orders" />
      <NavItem to="/dashboard/options" icon={<Layers size={20} />} label="Options" />
    </div>
  );
};

const NavItem = ({ icon, label, to, end }: any) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
      isActive 
        ? "text-primary" 
        : "text-muted-foreground hover:text-primary"
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

export default BottomNav;
