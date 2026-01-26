import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import StockChart from "../components/dashboard/StockChart";
import TradeModal from "../components/dashboard/TradeModal";
import MarketDepth from "../components/dashboard/MarketDepth";
import OptionChain from "../components/dashboard/OptionChain";
import StockNews from "../components/dashboard/StockNews";
import AlertModal from "../components/dashboard/AlertModal";
import api from "../lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const StockDetail = () => {
  const { symbol } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

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
        <div className="flex gap-3 w-full md:w-auto">
            <Button size="lg" className="flex-1 md:w-32 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsTradeOpen(true)}>Trade</Button>
            <Button size="lg" variant="outline" className="flex-1 md:w-32" onClick={() => setIsAlertOpen(true)}>Alert</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="options">Option Chain</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[450px]">
                    <StockChart symbol={data.symbol} />
                </div>
                <div className="lg:col-span-1">
                    <MarketDepth price={data.price} />
                </div>
            </div>

            {/* Fundamentals / Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Open" value={data.open} />
                <StatCard label="Previous Close" value={data.prevClose} />
                <StatCard label="Day High" value={data.dayHigh} />
                <StatCard label="Day Low" value={data.dayLow} />
            </div>

            {/* News Section */}
            <StockNews symbol={data.symbol} />
        </TabsContent>

        <TabsContent value="options">
            <OptionChain symbol={data.symbol} spotPrice={data.price} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TradeModal 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)} 
        onSuccess={() => {}} 
      />

      <AlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
        symbol={data.symbol}
        assetId={data.id}
        currentPrice={data.price}
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
