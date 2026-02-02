import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

const StockChart = ({ symbol }: { symbol: string }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [range, setRange] = useState('3m');
  const { theme } = useTheme();

  const ranges = [
      { label: '1D', value: '1d' },
      { label: '1W', value: '1w' },
      { label: '1M', value: '1m' },
      { label: '3M', value: '3m' },
  ];

  // 1. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#D9D9D9' : '#333',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? 'rgba(42, 46, 57, 0.5)' : '#e1e1e1' },
        horzLines: { color: theme === 'dark' ? 'rgba(42, 46, 57, 0.5)' : '#e1e1e1' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      crosshair: {
          mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
          borderColor: theme === 'dark' ? 'rgba(197, 203, 206, 0.8)' : 'rgba(197, 203, 206, 1)',
      },
      timeScale: {
          borderColor: theme === 'dark' ? 'rgba(197, 203, 206, 0.8)' : 'rgba(197, 203, 206, 1)',
      },
      // Mobile Optimization
      handleScale: {
          axisPressedMouseMove: true,
      },
      handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', 
        downColor: '#ef5350', 
        borderVisible: false, 
        wickUpColor: '#26a69a', 
        wickDownColor: '#ef5350' 
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Responsive Resize
    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
    };
  }, [theme]);

  // 2. Fetch Data
  useEffect(() => {
    if (!symbol || !seriesRef.current) return;

    const fetchData = async () => {
        try {
            const res = await api.get(`/market/history/${symbol}?range=${range}`);
            const raw = res.data.data.candles;
            if (!raw || raw.length === 0) return;

            // Format for Lightweight Charts: { time: 'yyyy-mm-dd', open, high, low, close }
            // Note: time needs to be string 'YYYY-MM-DD' or timestamp (seconds)
            const data = raw.map((d: any) => ({
                time: new Date(d.time).getTime() / 1000 + 19800, // Adjust timezone if needed or just use timestamp
                // Using raw timestamp is safest. 
                // Yahoo returns date string. '2023-01-01'.
                // If range is 1d/1w, we might get intraday time?
                // Backend 'getHistory' returns 'd.date' which is ISO string.
                // For daily, just YYYY-MM-DD string is best. For intraday, timestamp (seconds).
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close
            }));
            
            // Sort by time just in case
            data.sort((a: any, b: any) => a.time - b.time);

            // De-duplicate times (Lightweight charts crashes on duplicate times)
            const uniqueData = [];
            let lastTime = null;
            for (const item of data) {
                if (item.time !== lastTime) {
                    uniqueData.push(item);
                    lastTime = item.time;
                }
            }

            seriesRef.current.setData(uniqueData);
            chartRef.current?.timeScale().fitContent();
        } catch (e) {
            console.error(e);
        }
    };

    fetchData();
  }, [symbol, range]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base md:text-lg">{symbol}</CardTitle>
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
      <CardContent className="p-0 flex-1 min-h-[300px] relative">
         <div ref={chartContainerRef} className="absolute inset-0" />
      </CardContent>
    </Card>
  );
};

export default StockChart;