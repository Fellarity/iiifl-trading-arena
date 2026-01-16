import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const Pricing = () => {
  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          No hidden fees. No subscription charges. Just pay for what you trade.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Equity Delivery */}
        <Card className="border-2 border-transparent hover:border-primary/50 transition-colors">
            <CardHeader>
                <CardTitle className="text-2xl">Equity Delivery</CardTitle>
                <p className="text-muted-foreground">For long term investors</p>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold mb-6">₹0<span className="text-lg font-normal text-muted-foreground">/order</span></div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Zero Brokerage</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Free Demat Account</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Zero Annual Fees (1st Year)</li>
                </ul>
                <Button className="w-full" variant="outline">Open Account</Button>
            </CardContent>
        </Card>

        {/* Intraday & F&O */}
        <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg">Most Popular</div>
            <CardHeader>
                <CardTitle className="text-2xl">Intraday & F&O</CardTitle>
                <p className="text-muted-foreground">For active traders</p>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold mb-6">₹20<span className="text-lg font-normal text-muted-foreground">/order</span></div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Flat fee per executed order</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Lower of ₹20 or 0.03%</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Advanced Charting Free</li>
                </ul>
                <Button className="w-full">Start Trading</Button>
            </CardContent>
        </Card>

        {/* Direct Mutual Funds */}
        <Card className="border-2 border-transparent hover:border-primary/50 transition-colors">
            <CardHeader>
                <CardTitle className="text-2xl">Direct Mutual Funds</CardTitle>
                <p className="text-muted-foreground">For wealth builders</p>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold mb-6">₹0<span className="text-lg font-normal text-muted-foreground">/commissions</span></div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> 0% Commission</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> Direct Plans Only</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20} /> SIP & Lumpsum support</li>
                </ul>
                <Button className="w-full" variant="outline">Invest Now</Button>
            </CardContent>
        </Card>

      </div>

      <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground">* Regulatory charges like STT, GST, Stamp Duty apply as per government norms.</p>
      </div>
    </div>
  );
};

export default Pricing;
