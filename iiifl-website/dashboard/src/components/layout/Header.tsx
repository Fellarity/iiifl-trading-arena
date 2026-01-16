import { Bell, Search, User, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import TradeModal from '../dashboard/TradeModal';
import { ModeToggle } from '../ui/mode-toggle';
import { NotificationDropdown } from '../dashboard/Notifications';

const Header = () => {
  const { user } = useAuth();
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b bg-card flex items-center justify-between px-6 md:px-10 sticky top-0 z-10 transition-colors duration-300">
        
        {/* Search (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full w-96">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search stocks, mutual funds..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>

        <div className="md:hidden font-bold text-lg">Dashboard</div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 relative">
          <Button onClick={() => setIsTradeOpen(true)} className="gap-2 hidden sm:flex mr-2">
             <Plus size={16} /> Trade
          </Button>

          <ModeToggle />

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={20} />
            {/* Mock Unread Indicator */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          {isNotifOpen && (
             <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
          )}
          
          <div className="flex items-center gap-3 pl-4 border-l ml-2">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Trader'}</p>
            </div>
            <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>
      
      <TradeModal 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)} 
        onSuccess={() => window.location.reload()} // Simple refresh to update data
      />
    </>
  );
};

export default Header;
