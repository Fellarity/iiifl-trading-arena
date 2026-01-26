import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const OptionChain = ({ symbol, spotPrice }: { symbol: string, spotPrice: number }) => {
  const [chain, setChain] = useState<any[]>([]);

  useEffect(() => {
      // Generate simulated chain
      const generateChain = (spot: number) => {
        const step = spot > 1000 ? 50 : 10;
        const atmStrike = Math.round(spot / step) * step;
        const strikes = [];

        for (let i = -5; i <= 5; i++) {
            const strike = atmStrike + (i * step);
            const dist = strike - spot;
            
            let callIntrinsic = Math.max(0, spot - strike);
            let putIntrinsic = Math.max(0, strike - spot);
            const timeValue = Math.max(5, (spot * 0.01) - (Math.abs(dist) * 0.005)); 

            strikes.push({
                strike: strike,
                callLtp: (callIntrinsic + timeValue + (Math.random() * 2)).toFixed(2),
                callOi: Math.floor(Math.random() * 100000),
                putLtp: (putIntrinsic + timeValue + (Math.random() * 2)).toFixed(2),
                putOi: Math.floor(Math.random() * 100000),
                isAtm: i === 0
            });
        }
        return strikes;
      };

      setChain(generateChain(spotPrice));
  }, [spotPrice]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between">
            <span>Option Chain (Exp: 25 Jan)</span>
            <Badge variant="outline">{symbol} Spot: {spotPrice}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
            <table className="w-full text-xs text-center">
                <thead className="bg-secondary/50 text-muted-foreground border-b font-medium">
                    <tr>
                        <th className="py-2" colSpan={2}>CALLS</th>
                        <th className="py-2 bg-background border-x">STRIKE</th>
                        <th className="py-2" colSpan={2}>PUTS</th>
                    </tr>
                    <tr className="border-b">
                        <th className="pb-2">OI</th>
                        <th className="pb-2">LTP</th>
                        <th className="pb-2 bg-background border-x"></th>
                        <th className="pb-2">LTP</th>
                        <th className="pb-2">OI</th>
                    </tr>
                </thead>
                <tbody className="font-mono">
                    {chain.map((row) => (
                        <tr key={row.strike} className={`border-b last:border-0 hover:bg-secondary/30 transition-colors ${row.isAtm ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 text-muted-foreground">{row.callOi.toLocaleString()}</td>
                            <td className="py-2 text-emerald-500 font-bold bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/20">{row.callLtp}</td>
                            <td className={`py-2 font-bold border-x bg-background ${row.isAtm ? 'text-primary' : ''}`}>{row.strike}</td>
                            <td className="py-2 text-emerald-500 font-bold bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/20">{row.putLtp}</td>
                            <td className="py-2 text-muted-foreground">{row.putOi.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionChain;
