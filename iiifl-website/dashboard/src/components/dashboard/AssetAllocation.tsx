import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import api from "../../lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#64748b", "#8b5cf6", "#ec4899"];

const AssetAllocation = () => {
  const [data, setData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    api.get('/portfolio').then(res => {
      const holdings = res.data.data.holdings;
      const cash = Number(res.data.data.cash.balance);
      
      const totalEquity = holdings.reduce((acc: number, curr: any) => acc + Number(curr.total_value), 0);
      const total = totalEquity + cash;

      const chartData = [
        { name: "Cash", value: Math.round((cash / (total || 1)) * 100) },
        ...holdings.map((h: any) => ({
          name: h.symbol,
          value: Math.round((Number(h.total_value) / (total || 1)) * 100)
        }))
      ];
      
      // Filter out negligible
      setData(chartData.filter(d => d.value > 0));
    });
  }, []);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-2xl font-bold">100%</span>
            <p className="text-xs text-muted-foreground">Diversified</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
