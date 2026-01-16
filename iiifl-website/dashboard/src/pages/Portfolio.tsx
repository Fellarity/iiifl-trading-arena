import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowUpRight, ArrowDownRight, RefreshCw, IndianRupee } from "lucide-react";
import api from "../lib/api";

const Portfolio = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading && !data) return <div className="p-8 text-center">Loading Portfolio...</div>;

  const holdings = data?.holdings || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
       
       <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
              <p className="text-muted-foreground">Real-time view of your holdings.</p>
            </div>
            <Button onClick={fetchPortfolio} variant="outline" size="sm" className="gap-2">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
       </div>

       {/* Summary Row */}
       <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Worth</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹ {Math.round(summary.total_portfolio_value || 0).toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Invested</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹ {Math.round(summary.total_invested || 0).toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Current Value</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹ {Math.round(summary.current_value || 0).toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total P&L</CardTitle></CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold flex items-center ${(summary.current_value - summary.total_invested) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {(summary.current_value - summary.total_invested) >= 0 ? '+' : ''} 
                        ₹ {Math.round(summary.current_value - summary.total_invested).toLocaleString()}
                        <span className="text-sm ml-2 font-normal">
                           ({summary.total_invested > 0 
                               ? ((summary.current_value - summary.total_invested) / summary.total_invested * 100).toFixed(2) 
                               : "0.00"}%)
                        </span>
                    </div>
                </CardContent>
            </Card>
       </div>

       {/* Holdings Table */}
       <Card>
         <CardHeader>
           <CardTitle>Holdings ({holdings.length})</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-muted-foreground border-b bg-secondary/30">
                 <tr>
                   <th className="px-4 py-3">Instrument</th>
                   <th className="px-4 py-3 text-right">Qty</th>
                   <th className="px-4 py-3 text-right">Avg. Cost</th>
                   <th className="px-4 py-3 text-right">LTP</th>
                   <th className="px-4 py-3 text-right">Cur. Value</th>
                   <th className="px-4 py-3 text-right">P&L</th>
                   <th className="px-4 py-3 text-right">% Chg</th>
                 </tr>
               </thead>
               <tbody>
                 {holdings.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No holdings found. Start trading!</td></tr>
                 ) : (
                    holdings.map((h: any) => (
                    <tr key={h.symbol} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4">
                            <div className="font-bold">{h.symbol}</div>
                            <div className="text-xs text-muted-foreground">{h.name}</div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono">{h.quantity}</td>
                        <td className="px-4 py-4 text-right font-mono">₹{Number(h.average_buy_price).toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-mono font-medium">
                            ₹{Number(h.live_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono">₹{Math.round(h.total_value).toLocaleString()}</td>
                        <td className={`px-4 py-4 text-right font-mono font-medium ${h.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {h.pnl >= 0 ? '+' : ''}{Math.round(h.pnl).toLocaleString()}
                        </td>
                        <td className={`px-4 py-4 text-right font-mono ${h.pnl_percent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {h.pnl_percent >= 0 ? <ArrowUpRight size={14} className="inline mr-1"/> : <ArrowDownRight size={14} className="inline mr-1"/>}
                            {Number(h.pnl_percent).toFixed(2)}%
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
  );
};

export default Portfolio;
