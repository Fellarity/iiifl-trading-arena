import { Bell, Search, User, Plus, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import TradeModal from '../dashboard/TradeModal';
import { ModeToggle } from '../ui/mode-toggle';
import { NotificationDropdown } from '../dashboard/Notifications';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import MobileNav from './MobileNav';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch Unread Count
  useEffect(() => {
    const fetchCount = async () => {
        try {
            const res = await api.get('/notifications');
            const unread = res.data.data.notifications.filter((n: any) => !n.is_read).length;
            setUnreadCount(unread);
        } catch (e) { console.error(e); }
    };
    fetchCount();
    // Poll for notifications
    const interval = setInterval(fetchCount, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounceFn = setTimeout(() => {
        api.get(`/assets/search?query=${searchQuery}`)
           .then(res => setSearchResults(res.data.data.assets));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
        setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelect = (symbol: string) => {
      setSearchQuery("");
      setSearchResults([]);
      navigate(`/dashboard/stock/${symbol}`);
  };

  return (
    <>
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-10 sticky top-0 z-10 transition-colors duration-300">
        
        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                <Menu size={24} />
            </Button>
            <div className="font-bold text-lg">iiifl</div>
        </div>

        {/* Search */}
        <div className="hidden md:block relative w-96">
          <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
            <Search size={18} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search stocks (e.g. RELIANCE)..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-card border rounded-md mt-1 shadow-lg max-h-60 overflow-auto z-20">
                {searchResults.map(asset => (
                    <div 
                        key={asset.id} 
                        className="px-3 py-2 hover:bg-secondary cursor-pointer flex justify-between items-center"
                        onClick={() => handleSelect(asset.symbol)}
                    >
                        <div>
                            <div className="font-bold text-sm">{asset.symbol}</div>
                            <div className="text-xs text-muted-foreground">{asset.name}</div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>

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
            {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Button>

          {isNotifOpen && (
             <NotificationDropdown 
                onClose={() => setIsNotifOpen(false)} 
                onRead={() => setUnreadCount(0)} // Callback when read
             />
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
      
      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      <TradeModal 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)} 
        onSuccess={() => window.location.reload()} // Simple refresh to update data
      />
    </>
  );
};

export default Header;
