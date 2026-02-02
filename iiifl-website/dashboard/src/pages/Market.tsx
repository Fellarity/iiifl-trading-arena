import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Search, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const Market = () => {
  const navigate = useNavigate();
  const [indices, setIndices] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Favorites");
  // const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
          api.get('/market/indices'),
          api.get('/market/watchlist'),
          api.get('/market/movers')
      ]);

      if (results[0].status === 'fulfilled') setIndices(results[0].value.data.data.indices);
      if (results[1].status === 'fulfilled') setWatchlist(results[1].value.data.data.watchlist);
      if (results[2].status === 'fulfilled') {
          setGainers(results[2].value.data.data.gainers);
          setLosers(results[2].value.data.data.losers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
        const res = await api.get(`/assets/search?query=${searchQuery}`);
        setSearchResults(res.data.data.assets);
    } catch (err) { console.error(err); }
  };

  const addToWatchlist = async (assetId: number) => {
      try {
          await api.post('/market/watchlist', { assetId, tag: activeTab });
          setSearchQuery("");
          setSearchResults([]);
          fetchData();
      } catch (err) { alert("Failed to add"); }
  };

  const removeFromWatchlist = async (id: number) => {
      try {
          await api.delete(`/market/watchlist/${id}`);
          fetchData();
      } catch (err) { alert("Failed to remove"); }
  };

  // Group by Tag
  const tags = [...new Set(watchlist.map(w => w.tag || "Favorites"))];
  if (!tags.includes("Favorites")) tags.unshift("Favorites");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market</h2>
          <p className="text-muted-foreground">Live indices and intraday movers.</p>
        </div>
      </div>

      {/* Indices */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {indices.map((idx) => (
          <div key={idx.symbol} onClick={() => navigate(`/dashboard/stock/${idx.symbol}`)} className="cursor-pointer transition-transform hover:scale-[1.02]">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{idx.name}</CardTitle>
                {idx.change >= 0 ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-red-500" />}
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">₹{idx.price.toLocaleString()}</div>
                <p className={`text-xs ${idx.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {idx.change > 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
                </p>
                </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Intraday Movers */}
      <div className="grid gap-6 md:grid-cols-2">
          {/* Top Gainers */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-500">
                      <TrendingUp size={20} /> Top Intraday Gainers
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {gainers.length === 0 ? <p className="text-sm text-muted-foreground">Loading movers...</p> : gainers.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between border-b pb-2 last:border-0 cursor-pointer hover:bg-secondary/50 p-2 rounded" onClick={() => navigate(`/dashboard/stock/${stock.symbol}`)}>
                          <div>
                              <div className="font-bold">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground">{stock.name}</div>
                          </div>
                          <div className="text-right">
                              <div className="font-mono">₹{stock.price.toLocaleString()}</div>
                              <div className="text-xs text-emerald-500 font-bold">+{stock.changePercent.toFixed(2)}%</div>
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-500">
                      <TrendingDown size={20} /> Top Intraday Losers
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {losers.length === 0 ? <p className="text-sm text-muted-foreground">Loading movers...</p> : losers.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between border-b pb-2 last:border-0 cursor-pointer hover:bg-secondary/50 p-2 rounded" onClick={() => navigate(`/dashboard/stock/${stock.symbol}`)}>
                          <div>
                              <div className="font-bold">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground">{stock.name}</div>
                          </div>
                          <div className="text-right">
                              <div className="font-mono">₹{stock.price.toLocaleString()}</div>
                              <div className="text-xs text-red-500 font-bold">{stock.changePercent.toFixed(2)}%</div>
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>
      </div>

      {/* Watchlist with Tabs */}
      <Tabs defaultValue="Favorites" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
            <TabsList>
                {tags.map(tag => (
                    <TabsTrigger key={tag} value={tag}>{tag}</TabsTrigger>
                ))}
            </TabsList>
            
            {/* Add to Watchlist Search */}
            <div className="relative w-64">
                <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background">
                    <Search size={16} className="text-muted-foreground" />
                    <input 
                        className="bg-transparent outline-none text-sm w-full"
                        placeholder={`Add to ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                </div>
                {searchResults.length > 0 && (
                    <div className="absolute top-full right-0 w-full bg-card border rounded-md mt-1 shadow-lg z-10">
                        {searchResults.map(asset => (
                            <div key={asset.id} className="p-2 hover:bg-secondary cursor-pointer text-sm flex justify-between" onClick={() => addToWatchlist(asset.id)}>
                                <span>{asset.symbol}</span>
                                <PlusIcon />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {tags.map(tag => (
            <TabsContent key={tag} value={tag}>
                <Card>
                    <CardContent className="pt-6">
                        {watchlist.filter(w => (w.tag || "Favorites") === tag).length === 0 ? (
                            <p className="text-muted-foreground text-sm">Empty watchlist.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-muted-foreground border-b">
                                        <tr>
                                            <th className="pb-3 pl-2">Symbol</th>
                                            <th className="pb-3">Price</th>
                                            <th className="pb-3">Change</th>
                                            <th className="pb-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {watchlist.filter(w => (w.tag || "Favorites") === tag).map((item) => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/stock/${item.symbol}`)}>
                                                <td className="py-4 pl-2 font-bold">{item.symbol}</td>
                                                <td className="py-4">₹{item.price?.toLocaleString()}</td>
                                                <td className={`py-4 ${item.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                    {item.changePercent?.toFixed(2)}%
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.id); }}>
                                                        <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default Market;