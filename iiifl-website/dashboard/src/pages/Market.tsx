import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Trash2, TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import api from "../lib/api";
import StockChart from "../components/dashboard/StockChart";

const Market = () => {
  const [indices, setIndices] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Indices
      try {
        const idxRes = await api.get('/market/indices');
        setIndices(idxRes.data?.data?.indices || []);
      } catch (e) {
        console.error("Failed to load indices", e);
        setIndices([]);
      }

      // Fetch Watchlist
      try {
        const wlRes = await api.get('/market/watchlist');
        const list = wlRes.data?.data?.watchlist || [];
        setWatchlist(list);
        
        if (!selectedSymbol && list.length > 0) {
            setSelectedSymbol(list[0].symbol);
        }
      } catch (e) {
        console.error("Failed to load watchlist", e);
        setWatchlist([]);
      }

    } catch (err) {
      console.error("Critical Market Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const addToWatchlist = async (assetId: string) => {
      try {
          await api.post('/market/watchlist', { assetId });
          setSearchQuery("");
          setSearchResults([]);
          fetchData(); 
      } catch (err) {
          alert("Failed to add");
      }
  };

  const removeFromWatchlist = async (id: string) => {
      try {
          await api.delete(`/market/watchlist/${id}`);
          fetchData();
      } catch (err) {
          alert("Failed to remove");
      }
  };

  return (
    <div className="space-y-6">
       
       <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Market</h2>
              <p className="text-muted-foreground">Track indices and your favorite stocks.</p>
            </div>
       </div>

       {/* Indices */}
       <div className="grid gap-4 md:grid-cols-2">
          {indices?.map(idx => (
            <Card key={idx.symbol}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{idx.name}</CardTitle>
                    {idx.change >= 0 ? <TrendingUp className="text-emerald-500" size={20} /> : <TrendingDown className="text-red-500" size={20} />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.round(idx.price).toLocaleString()}</div>
                    <p className={`text-xs mt-1 ${idx.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {idx.change > 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
                    </p>
                </CardContent>
            </Card>
          ))}
       </div>

       {/* Main Content: Chart + Watchlist */}
       <div className="grid gap-6 md:grid-cols-3">
           
           {/* Chart (Takes 2 columns) */}
           <div className="md:col-span-2 space-y-6">
               {selectedSymbol ? (
                   <StockChart symbol={selectedSymbol} />
               ) : (
                   <Card className="h-[300px] flex items-center justify-center text-muted-foreground">
                       Select a stock to view chart
                   </Card>
               )}

               {/* Add Symbol (Moved here for better layout) */}
               <Card className="h-fit">
                <CardHeader>
                    <CardTitle>Add Symbol</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search stocks to add..."
                            className="w-full pl-9 pr-4 py-2 border rounded-md bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-card border rounded-md mt-1 shadow-lg max-h-60 overflow-auto z-10">
                                {searchResults.map(asset => (
                                    <div 
                                        key={asset.id} 
                                        className="px-3 py-2 hover:bg-secondary cursor-pointer flex justify-between items-center"
                                        onClick={() => addToWatchlist(asset.id)}
                                    >
                                        <div>
                                            <div className="font-bold text-sm">{asset.symbol}</div>
                                            <div className="text-xs text-muted-foreground">{asset.name}</div>
                                        </div>
                                        <Plus size={16} className="text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
           </div>

           {/* Watchlist Table (Right Sidebar Style) */}
           <Card className="md:col-span-1 h-fit">
               <CardHeader>
                   <CardTitle>My Watchlist</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                           <thead className="text-muted-foreground border-b bg-secondary/30">
                               <tr>
                                   <th className="px-4 py-3">Symbol</th>
                                   <th className="px-4 py-3 text-right">Price</th>
                                   <th className="px-4 py-3 text-right"></th>
                               </tr>
                           </thead>
                           <tbody>
                               {watchlist?.length === 0 ? (
                                   <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">Watchlist is empty.</td></tr>
                               ) : (
                                   watchlist?.map(item => (
                                       <tr 
                                         key={item.id} 
                                         className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer ${selectedSymbol === item.symbol ? 'bg-secondary' : ''}`}
                                         onClick={() => setSelectedSymbol(item.symbol)}
                                       >
                                           <td className="px-4 py-4 font-medium">
                                               {item.symbol}
                                               <div className={`text-[10px] ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                  {item.changePercent?.toFixed(2)}%
                                               </div>
                                           </td>
                                           <td className="px-4 py-4 text-right font-mono">₹{item.price.toFixed(2)}</td>
                                           <td className="px-2 py-4 text-right">
                                               <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.id); }}>
                                                   <Trash2 size={14} />
                                               </Button>
                                           </td>
                                       </tr>
                                   ))
                               )}
                           </tbody>
                       </table>
                   </div>
               </CardContent>
           </Card>

       </div>
    </div>
  );
};

export default Market;
