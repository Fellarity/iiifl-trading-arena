import { LayoutDashboard, Users, Activity, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModeToggle } from '../ui/mode-toggle';

const AdminSidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-slate-900 text-slate-50 z-20">
      <div className="p-6 flex items-center gap-2">
        <ShieldAlert className="text-red-500" />
        <div>
          <h1 className="text-xl font-bold">Admin</h1>
          <p className="text-xs text-slate-400">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
        <NavItem icon={<Users size={20} />} label="User Management" />
        <NavItem icon={<Activity size={20} />} label="System Analytics" />
        <NavItem icon={<Settings size={20} />} label="Configuration" />
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-4">
           <span className="text-xs text-slate-400">Theme</span>
           <ModeToggle />
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button
    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-md transition-all ${
      active 
        ? "bg-red-600 text-white" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AdminSidebar;
