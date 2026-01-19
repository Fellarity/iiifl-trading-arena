import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import api from "../../lib/api";

const Positions = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
        try {
            const res = await api.get('/portfolio/positions');
            setPositions(res.data.data.positions);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading positions...</div>;

  return (
    <Card className="col-span-7">
        <CardHeader>
            <CardTitle>Open Positions (Day)</CardTitle>
        </CardHeader>
        <CardContent>
            {positions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open intraday positions.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-muted-foreground border-b">
                            <tr>
                                <th className="pb-3 pl-2">Instrument</th>
                                <th className="pb-3">Product</th>
                                <th className="pb-3">Qty</th>
                                <th className="pb-3">Avg.</th>
                                <th className="pb-3">LTP</th>
                                <th className="pb-3 text-right">P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((p) => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/50">
                                    <td className="py-4 pl-2 font-bold">
                                        {p.symbol} <span className="text-[10px] font-normal text-muted-foreground ml-1">NSE</span>
                                    </td>
                                    <td className="py-4"><Badge variant="outline" className="text-[10px]">{p.product_type}</Badge></td>
                                    <td className="py-4">{p.quantity}</td>
                                    <td className="py-4">₹{Number(p.average_price).toFixed(2)}</td>
                                    <td className="py-4">₹{p.live_price?.toFixed(2)}</td>
                                    <td className={`py-4 text-right font-bold ${p.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {p.pnl >= 0 ? '+' : ''}{p.pnl?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </CardContent>
    </Card>
  );
};

export default Positions;
