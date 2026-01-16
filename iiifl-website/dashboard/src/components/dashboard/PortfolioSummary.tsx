import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ArrowDownRight, IndianRupee } from "lucide-react";
import api from "../../lib/api";

const PortfolioSummary = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/portfolio');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="grid gap-4 md:grid-cols-3 animate-pulse"><div className="h-32 bg-secondary rounded"></div></div>;

  const totalInvested = data?.summary?.total_invested || 0;
  const cashBalance = Number(data?.cash?.balance) || 0;
  // Mock current value calculation (assuming +5% gain for demo since we lack live prices)
  const currentValue = totalInvested * 1.05; 
  const totalPortfolioValue = currentValue + cashBalance;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard 
        title="Total Portfolio Value" 
        value={`₹ ${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        change="+5.0%" 
        trend="up"
      />
      <SummaryCard 
        title="Cash Balance" 
        value={`₹ ${cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
        change="Available" 
        trend="neutral"
        subtext="Funds for trading"
      />
      <SummaryCard 
        title="Invested Amount" 
        value={`₹ ${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        change={totalInvested > 0 ? "+12%" : "0%"} 
        trend="up"
        subtext="Current Holdings Cost"
      />
    </div>
  );
};

const SummaryCard = ({ title, value, change, trend, subtext }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <IndianRupee size={16} className="text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs flex items-center mt-1 ${
          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500'
        }`}>
        {trend === 'up' && <ArrowUpRight size={14} className="mr-1" />}
        {trend === 'down' && <ArrowDownRight size={14} className="mr-1" />}
        {change}
        <span className="text-muted-foreground ml-1">
          {subtext ? subtext : "from last month"}
        </span>
      </p>
    </CardContent>
  </Card>
);

export default PortfolioSummary;
