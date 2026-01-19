import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import StockChart from "../components/dashboard/StockChart";
import TradeModal from "../components/dashboard/TradeModal";
import api from "../lib/api";

const StockDetail = () => {
  const { symbol } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const fetchData = async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const res = await api.get(`/market/quote/${symbol}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  if (loading) return <div className="p-10 text-center">Loading Stock Data...</div>;
  if (!data) return <div className="p-10 text-center">Stock not found.</div>;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
                {data.symbol} 
                <span className="text-lg font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">NSE</span>
            </h1>
            <div className={`text-2xl mt-2 flex items-center font-mono ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ₹{data.price.toLocaleString()}
                <span className="text-base ml-3 flex items-center">
                    {data.change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
                </span>
            </div>
        </div>
        <div className="flex gap-3">
            <Button size="lg" className="w-32" onClick={() => setIsTradeOpen(true)}>Trade</Button>
            <Button size="lg" variant="outline" className="w-32">Alert</Button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[400px]">
          <StockChart symbol={data.symbol} />
      </div>

      {/* Fundamentals / Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Open" value={data.open} />
          <StatCard label="Previous Close" value={data.prevClose} />
          <StatCard label="Day High" value={data.dayHigh} />
          <StatCard label="Day Low" value={data.dayLow} />
      </div>

      {/* Modal */}
      <TradeModal 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)} 
        onSuccess={() => {}} // No refresh needed for this page unless we show holdings here
      />

    </div>
  );
};

const StatCard = ({ label, value }: { label: string, value: number }) => (
    <Card>
        <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-lg font-bold font-mono">₹{value?.toLocaleString()}</p>
        </CardContent>
    </Card>
);

export default StockDetail;
