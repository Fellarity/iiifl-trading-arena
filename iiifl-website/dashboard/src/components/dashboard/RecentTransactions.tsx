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
        <div className="overflow-x-auto">
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
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
