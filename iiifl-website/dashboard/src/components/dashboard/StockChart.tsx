import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';
import { calculateSMA, calculateEMA } from '../../lib/indicators';
import { Settings2 } from 'lucide-react';

const StockChart = ({ symbol }: { symbol: string }) => {
  const [rawData, setRawData] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [range, setRange] = useState('3m');
  const [indicators, setIndicators] = useState<string[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (!symbol) return;
    
    // Fetch with selected range
    api.get(`/market/history/${symbol}?range=${range}`)
       .then(res => {
           const raw = res.data.data.candles;
           if (!raw || raw.length === 0) {
               setRawData([]);
               return;
           }
           // Format: [timestamp, open, high, low, close]
           const data = raw.map((d: any) => ({
               x: new Date(d.time),
               y: [d.open, d.high, d.low, d.close]
           }));
           setRawData(data);
       })
       .catch(console.error);
  }, [symbol, range]);

  // Recalculate series when rawData or indicators change
  useEffect(() => {
      if (rawData.length === 0) {
          setSeries([]);
          return;
      }

      let chartSeries: any[] = [{ name: 'Price', type: 'candlestick', data: rawData }];

      if (indicators.includes('SMA20')) {
          chartSeries.push({ name: 'SMA 20', type: 'line', data: calculateSMA(rawData, 20) });
      }
      if (indicators.includes('EMA50')) {
          chartSeries.push({ name: 'EMA 50', type: 'line', data: calculateEMA(rawData, 50) });
      }

      setSeries(chartSeries);
  }, [rawData, indicators]);

  const toggleIndicator = (ind: string) => {
      setIndicators(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  };

  const options: any = {
    chart: {
      type: 'candlestick', // Default, but overridden by series type
      height: 300,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: true }
    },
    theme: {
        mode: theme === 'dark' ? 'dark' : 'light'
    },
    stroke: {
        width: [1, 2, 2], // Candle border, Line 1, Line 2
        curve: 'smooth'
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
      opposite: true 
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
    },
    legend: {
        position: 'top',
        horizontalAlign: 'left'
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
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-2">
        <div className="flex items-center gap-2">
            <CardTitle className="text-base md:text-lg">{symbol}</CardTitle>
            
            {/* Indicators Toggle */}
            <div className="flex gap-1 ml-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-6 text-[10px] px-2 ${indicators.includes('SMA20') ? 'bg-primary/20 border-primary' : ''}`}
                    onClick={() => toggleIndicator('SMA20')}
                >
                    SMA 20
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-6 text-[10px] px-2 ${indicators.includes('EMA50') ? 'bg-primary/20 border-primary' : ''}`}
                    onClick={() => toggleIndicator('EMA50')}
                >
                    EMA 50
                </Button>
            </div>
        </div>
        
        {/* Ranges */}
        <div className="flex bg-secondary/50 rounded-lg p-1 gap-1 self-start md:self-auto">
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
