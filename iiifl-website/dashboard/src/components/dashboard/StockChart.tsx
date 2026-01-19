import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

const StockChart = ({ symbol }: { symbol: string }) => {
  const [series, setSeries] = useState<any[]>([]);
  const [range, setRange] = useState('3m');
  const { theme } = useTheme();

  useEffect(() => {
    if (!symbol) return;
    
    // Fetch with selected range
    api.get(`/market/history/${symbol}?range=${range}`)
       .then(res => {
           const raw = res.data.data.candles;
           if (!raw || raw.length === 0) {
               setSeries([]);
               return;
           }
           // Format: [timestamp, open, high, low, close]
           const data = raw.map((d: any) => ({
               x: new Date(d.time),
               y: [d.open, d.high, d.low, d.close]
           }));
           setSeries([{ name: 'Price', data }]);
       })
       .catch(console.error);
  }, [symbol, range]);

  const options: any = {
    chart: {
      type: 'candlestick',
      height: 300,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: true }
    },
    theme: {
        mode: theme === 'dark' ? 'dark' : 'light'
    },
    xaxis: {
      type: 'datetime',
      labels: {
         datetimeFormatter: {
            year: 'yyyy',
            month: "MMM 'yy",
            day: 'dd MMM',
            hour: 'HH:mm'
         }
      }
    },
    yaxis: {
      tooltip: { enabled: true },
      opposite: true // Put y-axis on right for mobile friendliness (thumb doesn't cover)
    },
    grid: {
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        xaxis: { lines: { show: false } }
    },
    plotOptions: {
        candlestick: {
            colors: {
                upward: '#10b981',
                downward: '#ef4444'
            }
        }
    }
  };

  const ranges = [
      { label: '1D', value: '1d' },
      { label: '1W', value: '1w' },
      { label: '1M', value: '1m' },
      { label: '3M', value: '3m' },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base md:text-lg">{symbol}</CardTitle>
        
        {/* Mobile-friendly Toggles */}
        <div className="flex bg-secondary/50 rounded-lg p-1 gap-1">
            {ranges.map(r => (
                <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        range === r.value 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {r.label}
                </button>
            ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 min-h-[300px]">
        {series.length > 0 ? (
            <Chart 
                options={options} 
                series={series} 
                type="candlestick" 
                height="100%" 
                width="100%"
            />
        ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                {series.length === 0 ? "Loading Chart..." : "No Data"}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;
