import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

const StockChart = ({ symbol }: { symbol: string }) => {
  const [series, setSeries] = useState<any[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (!symbol) return;
    api.get(`/market/history/${symbol}`)
       .then(res => {
           const raw = res.data.data.candles;
           // Format: [timestamp, open, high, low, close]
           const data = raw.map((d: any) => ({
               x: new Date(d.time),
               y: [d.open, d.high, d.low, d.close]
           }));
           setSeries([{ name: 'Price', data }]);
       })
       .catch(console.error);
  }, [symbol]);

  const options: any = {
    chart: {
      type: 'candlestick',
      height: 300,
      background: 'transparent',
      toolbar: { show: false }
    },
    theme: {
        mode: theme === 'dark' ? 'dark' : 'light'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: { enabled: true }
    },
    grid: {
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{symbol} Chart (3 Months)</CardTitle>
      </CardHeader>
      <CardContent className="p-2 h-[320px]">
        {series.length > 0 ? (
            <Chart options={options} series={series} type="candlestick" height="100%" />
        ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading Chart...</div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;
