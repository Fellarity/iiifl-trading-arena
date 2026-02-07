import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Wallet, History } from "lucide-react";
import api from "../lib/api";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const Funds = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [mode, setMode] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  const fetchData = async () => {
    try {
      const res = await api.get('/portfolio');
      setBalance(Number(res.data.data.cash.balance));
      
      const txnRes = await api.get('/portfolio/transactions');
      setHistory(txnRes.data.data.transactions.filter((t: any) => t.type === 'DEPOSIT' || t.type === 'WITHDRAWAL'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    // Load Razorpay
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const handleDeposit = async () => {
      setLoading(true);
      try {
          // 1. Create Order
          const { data: { data: order } } = await api.post('/payment/order', { amount: Number(amount) });

          // 2. Open Razorpay
          const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1234567890", 
              amount: order.amount,
              currency: order.currency,
              name: "iiifl Pro",
              description: "Wallet Deposit",
              order_id: order.id,
              handler: async function (response: any) {
                  try {
                      await api.post('/payment/verify', {
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                          amount: Number(amount)
                      });
                      alert("Payment Successful!");
                      fetchData();
                      setAmount("");
                  } catch (e) {
                      alert("Payment Verification Failed");
                  }
              },
              theme: { color: "#3399cc" }
          };
          
          const rzp = new window.Razorpay(options);
          rzp.open();

      } catch (e) {
          alert("Failed to initiate payment");
      } finally {
          setLoading(false);
      }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.post('/portfolio/withdraw', { amount: Number(amount) });
          setAmount("");
          alert("Withdrawal Successful!");
          fetchData();
      } catch (err: any) {
          alert(err.response?.data?.message || "Failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6">
       
       <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Funds</h2>
              <p className="text-muted-foreground">Manage your wallet balance.</p>
            </div>
       </div>

       <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
           
           {/* Balance & Actions */}
           <Card className="col-span-1 h-fit order-1">
               <CardHeader>
                   <CardTitle className="flex items-center gap-2"><Wallet size={20} /> Available Cash</CardTitle>
               </CardHeader>
               <CardContent>
                   <div className="text-4xl font-bold mb-6">₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                   
                   <div className="flex gap-2 mb-6">
                       <Button 
                         variant={mode === 'DEPOSIT' ? 'default' : 'outline'} 
                         className="flex-1 py-6"
                         onClick={() => setMode('DEPOSIT')}
                       >
                         Add Money
                       </Button>
                       <Button 
                         variant={mode === 'WITHDRAW' ? 'destructive' : 'outline'} 
                         className="flex-1 py-6"
                         onClick={() => setMode('WITHDRAW')}
                       >
                         Withdraw
                       </Button>
                   </div>

                   <div className="space-y-4">
                       <div>
                           <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
                           <input
                               type="number"
                               min="1"
                               required
                               placeholder="Enter amount"
                               className="w-full px-3 py-3 border rounded-md bg-background text-xl font-mono"
                               value={amount}
                               onChange={(e) => setAmount(e.target.value)}
                           />
                       </div>
                       <Button 
                            className="w-full py-6 text-lg font-bold" 
                            disabled={loading || !amount}
                            onClick={mode === 'DEPOSIT' ? handleDeposit : handleWithdraw}
                        >
                           {loading ? 'Processing...' : `Confirm ${mode === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}`}
                       </Button>
                   </div>
               </CardContent>
           </Card>

           {/* History */}
           <Card className="col-span-1 md:col-span-2 order-2">
               <CardHeader>
                   <CardTitle className="flex items-center gap-2"><History size={20} /> Transaction History</CardTitle>
               </CardHeader>
               <CardContent className="max-h-[500px] overflow-y-auto">
                   {history.length === 0 ? (
                       <p className="text-center text-muted-foreground py-8">No fund transactions yet.</p>
                   ) : (
                       <div className="space-y-3">
                           {history.map((txn) => (
                               <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-secondary/20 transition-colors">
                                   <div className="flex items-center gap-4">
                                       <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                           {txn.type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                       </div>
                                       <div>
                                           <div className="font-bold text-sm md:text-base">{txn.type === 'DEPOSIT' ? 'Funds Added' : 'Funds Withdrawn'}</div>
                                           <div className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleString()}</div>
                                       </div>
                                   </div>
                                   <div className={`font-mono font-bold text-sm md:text-base ${txn.type === 'DEPOSIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                                       {txn.type === 'DEPOSIT' ? '+' : '-'} ₹ {Number(txn.price || 0).toLocaleString()}
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
               </CardContent>
           </Card>

       </div>
    </div>
  );
};

export default Funds;