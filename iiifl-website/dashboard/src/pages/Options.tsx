import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Options = () => {
  const [expiry] = useState("20 Jan 2026");
  
  // Mock Data around ATM 25500
  const strikes = [25300, 25350, 25400, 25450, 25500, 25550, 25600, 25650, 25700];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold">Option Chain</h2>
            <p className="text-muted-foreground text-sm">NIFTY 50 • 25,480.25</p>
        </div>
        <Button variant="outline">{expiry}</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-center text-xs md:text-sm">
                <thead className="bg-secondary/50 text-muted-foreground">
                    <tr>
                        <th colSpan={2} className="py-2 border-r border-border">CALLS</th>
                        <th className="py-2">STRIKE</th>
                        <th colSpan={2} className="py-2 border-l border-border">PUTS</th>
                    </tr>
                    <tr className="border-b border-border">
                        <th className="py-2 w-1/5">OI (Lakhs)</th>
                        <th className="py-2 w-1/5 border-r border-border">LTP</th>
                        <th className="py-2 w-1/5 bg-secondary/30">Price</th>
                        <th className="py-2 w-1/5 border-l border-border">LTP</th>
                        <th className="py-2 w-1/5">OI (Lakhs)</th>
                    </tr>
                </thead>
                <tbody>
                    {strikes.map((strike) => {
                        const isCallITM = strike < 25500;
                        const isPutITM = strike > 25500;
                        
                        return (
                            <tr key={strike} className="border-b border-border/50 hover:bg-secondary/20">
                                {/* Calls */}
                                <td className={`py-3 ${isCallITM ? 'bg-yellow-500/10 dark:bg-yellow-500/5' : ''}`}>{(Math.random()*50).toFixed(1)}</td>
                                <td className={`py-3 border-r border-border font-mono ${isCallITM ? 'bg-yellow-500/10 dark:bg-yellow-500/5' : ''}`}>
                                    {isCallITM ? (300 - (strike-25300)/2).toFixed(2) : (50 - (strike-25500)/10).toFixed(2)}
                                </td>
                                
                                {/* Strike */}
                                <td className="py-3 font-bold bg-secondary/30">{strike}</td>
                                
                                {/* Puts */}
                                <td className={`py-3 border-l border-border font-mono ${isPutITM ? 'bg-yellow-500/10 dark:bg-yellow-500/5' : ''}`}>
                                    {isPutITM ? (300 - (25700-strike)/2).toFixed(2) : (50 - (25500-strike)/10).toFixed(2)}
                                </td>
                                <td className={`py-3 ${isPutITM ? 'bg-yellow-500/10 dark:bg-yellow-500/5' : ''}`}>{(Math.random()*50).toFixed(1)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default Options;
