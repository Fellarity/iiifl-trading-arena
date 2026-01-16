import { BookOpen, Video, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const Learn = () => {
  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Master the markets</h1>
        <p className="text-xl text-muted-foreground">
          Free educational resources to help you become a better trader.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:bg-secondary/50 cursor-pointer transition-colors">
              <CardHeader><BookOpen className="text-primary h-8 w-8 mb-2" /><CardTitle>Modules</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">Comprehensive text-based courses on Technical Analysis, Fundamental Analysis, and Options Strategies.</CardContent>
          </Card>
          <Card className="hover:bg-secondary/50 cursor-pointer transition-colors">
              <CardHeader><Video className="text-red-500 h-8 w-8 mb-2" /><CardTitle>Video Tutorials</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">Step-by-step guides on how to use the iiifl platform, place orders, and read charts.</CardContent>
          </Card>
          <Card className="hover:bg-secondary/50 cursor-pointer transition-colors">
              <CardHeader><FileText className="text-blue-500 h-8 w-8 mb-2" /><CardTitle>Market Blog</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">Daily market updates, IPO reviews, and sector analysis from our expert research team.</CardContent>
          </Card>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-2">How do I open an account?</h3>
              <p className="text-muted-foreground text-sm">Click on the "Open Account" button, enter your Aadhaar-linked mobile number, complete the KYC using DigiLocker, and you're done in 5 minutes.</p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-2">Is my money safe?</h3>
              <p className="text-muted-foreground text-sm">Absolutely. iiifl is a registered stock broker with SEBI and a member of NSE & BSE. Your funds and securities are kept in separate accounts as per regulations.</p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-2">Can I trade in Commodities?</h3>
              <p className="text-muted-foreground text-sm">Yes, we support trading in MCX commodities like Gold, Silver, and Crude Oil with the same account.</p>
          </div>
      </div>

    </div>
  );
};

export default Learn;
