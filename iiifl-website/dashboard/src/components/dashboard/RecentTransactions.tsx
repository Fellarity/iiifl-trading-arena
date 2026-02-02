import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import api from "../../lib/api";

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await api.get('/portfolio/transactions');
        setTransactions(res.data.data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, []);

  if (loading) return <Card className="col-span-7"><CardContent className="p-6">Loading transactions...</CardContent></Card>;

  if (transactions.length === 0) return (
    <Card className="col-span-7">
      <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
      <CardContent><p className="text-muted-foreground text-sm">No transactions yet.</p></CardContent>
    </Card>
  );

  return (
    <Card className="col-span-7">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="pb-3 pl-2">Asset</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 pl-2 font-medium">{txn.stock}</td>
                  <td className="py-4">
                    <Badge variant={txn.type === 'BUY' ? 'secondary' : 'destructive'}>
                      {txn.type}
                    </Badge>
                  </td>
                  <td className="py-4">{txn.qty}</td>
                  <td className="py-4">₹{Number(txn.price).toLocaleString()}</td>
                  <td className="py-4 font-semibold">₹{(Number(txn.qty) * Number(txn.price)).toLocaleString()}</td>
                  <td className="py-4 text-xs text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <Badge variant="success">{txn.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden space-y-3">
            {transactions.map((txn) => (
                <div key={txn.id} className="border rounded-lg p-3 bg-secondary/10 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-sm">{txn.stock}</div>
                            <div className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString()}</div>
                        </div>
                        <Badge variant={txn.type === 'BUY' ? 'secondary' : 'destructive'} className="text-[10px]">
                            {txn.type}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-3">
                            <div>
                                <span className="text-xs text-muted-foreground block">Qty</span>
                                <span>{txn.qty}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Price</span>
                                <span>₹{Number(txn.price).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-muted-foreground block">Total</span>
                            <span className="font-bold">₹{(Number(txn.qty) * Number(txn.price)).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
