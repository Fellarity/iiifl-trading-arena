import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
          New: Algo Trading API
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
          Investing made <br /> simple & powerful.
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Commission-free investing, plus the tools you need to put your money in motion. 
          Real-time charts, advanced analysis, and instant execution.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 h-12" onClick={() => navigate("/login")}>
            Start Trading <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 h-12">
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">₹0 Brokerage</h3>
            <p className="text-muted-foreground">Zero commission on equity delivery trades. Keep 100% of your profits.</p>
          </div>
          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Fast</h3>
            <p className="text-muted-foreground">Lightning fast order execution with bank-grade security and encryption.</p>
          </div>
          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pro Charts</h3>
            <p className="text-muted-foreground">Advanced technical analysis tools powered by TradingView integration.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;
