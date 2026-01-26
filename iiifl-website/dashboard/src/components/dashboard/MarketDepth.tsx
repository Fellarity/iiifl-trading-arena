import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MarketDepth = ({ price }: { price: number }) => {
  // Generate simulated depth based on LTP
  const generateDepth = (base: number, isBuy: boolean) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const diff = (i + 1) * (base * 0.0005);
      const levelPrice = isBuy ? base - diff : base + diff;
      return {
        price: levelPrice.toFixed(2),
        quantity: Math.floor(Math.random() * 5000) + 100,
        orders: Math.floor(Math.random() * 50) + 1
      };
    });
  };

  const bids = generateDepth(price, true);
  const asks = generateDepth(price, false);

  const totalBuyQty = bids.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalSellQty = asks.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-bold flex justify-between">
            <span>Market Depth</span>
            <span className="text-[10px] text-muted-foreground uppercase">Real-time</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-[11px]">
        <div className="grid grid-cols-2 divide-x border-t border-b">
            <div className="p-2 bg-emerald-500/5">
                <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Bid</span>
                    <span>Qty</span>
                </div>
                {bids.map((b, i) => (
                    <div key={i} className="flex justify-between font-mono mb-1">
                        <span className="text-emerald-500">{b.price}</span>
                        <span>{b.quantity}</span>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-red-500/5">
                <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Ask</span>
                    <span>Qty</span>
                </div>
                {asks.map((a, i) => (
                    <div key={i} className="flex justify-between font-mono mb-1">
                        <span className="text-red-500">{a.price}</span>
                        <span>{a.quantity}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="p-2 grid grid-cols-2 text-[10px] uppercase font-bold">
            <div className="text-emerald-500 flex justify-between">
                <span>Total</span>
                <span>{totalBuyQty.toLocaleString()}</span>
            </div>
            <div className="text-red-500 flex justify-between pl-2">
                <span>Total</span>
                <span>{totalSellQty.toLocaleString()}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDepth;
