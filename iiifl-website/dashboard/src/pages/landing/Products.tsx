import { Laptop, Smartphone, Terminal, Zap } from "lucide-react";

const Products = () => {
  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Built for every kind of trader</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Whether you are a long-term investor or an F&O scalp trader, we have the right platform for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Laptop className="text-primary" /> iiifl Web
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
                Our flagship web trading platform. Lightning fast, packed with charts, and runs on any browser.
            </p>
            <ul className="space-y-3">
                <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> TradingView Charts</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Option Chain Analytics</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Instant Order Slicing</li>
            </ul>
        </div>
        <div className="order-1 md:order-2 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-2xl h-64 md:h-80 flex items-center justify-center border border-border">
            <span className="text-muted-foreground">Web Platform Preview</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="bg-gradient-to-tl from-emerald-500/20 to-blue-500/20 rounded-2xl h-64 md:h-80 flex items-center justify-center border border-border">
            <span className="text-muted-foreground">Mobile App Preview</span>
        </div>
        <div>
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Smartphone className="text-emerald-500" /> iiifl Mobile
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
                Trade on the go. Designed for speed and ease of use, with biometric security and instant alerts.
            </p>
            <ul className="space-y-3">
                <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> One-tap buy/sell</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Real-time P&L widgets</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Dark Mode native</li>
            </ul>
        </div>
      </div>

      <div className="text-center bg-card border border-border rounded-2xl p-12">
          <Terminal className="mx-auto h-12 w-12 text-primary mb-6" />
          <h2 className="text-3xl font-bold mb-4">API for Geeks</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Build your own trading bots with our free HTTP API. Connect with Python, Node.js, or Go.
          </p>
          <code className="bg-background px-4 py-2 rounded-md font-mono text-sm border border-border">
              pip install iiifl-connect
          </code>
      </div>

    </div>
  );
};

export default Products;
