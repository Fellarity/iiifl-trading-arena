import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import api from "../lib/api";

const Orders = () => {
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [executedOrders, setExecutedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
      try {
          const [openRes, execRes] = await Promise.all([
              api.get('/orders?status=open'),
              api.get('/orders?status=executed') // Currently executed might be empty if I rely on new table
          ]);
          setOpenOrders(openRes.data.data.orders);
          setExecutedOrders(execRes.data.data.orders);
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
  }, []);

  const cancelOrder = async (id: string) => {
      if (!confirm("Cancel this order?")) return;
      try {
          await api.put(`/orders/${id}/cancel`);
          fetchOrders();
      } catch (e) { alert("Failed to cancel"); }
  };

  const OrderTable = ({ orders, canCancel }: { orders: any[], canCancel?: boolean }) => (
      <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground border-b">
                  <tr>
                      <th className="pb-3 pl-2">Time</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Instrument</th>
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Qty</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Status</th>
                      {canCancel && <th className="pb-3 text-right">Action</th>}
                  </tr>
              </thead>
              <tbody>
                  {orders.length === 0 ? <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No orders found.</td></tr> : orders.map(o => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-secondary/50">
                          <td className="py-4 pl-2 text-xs text-muted-foreground">
                              {new Date(o.created_at).toLocaleTimeString()}
                          </td>
                          <td className="py-4">
                              <Badge variant={o.type === 'BUY' ? 'default' : 'destructive'} className="text-[10px]">
                                  {o.type}
                              </Badge>
                          </td>
                          <td className="py-4 font-bold">{o.symbol}</td>
                          <td className="py-4"><Badge variant="outline" className="text-[10px]">{o.product_type}</Badge></td>
                          <td className="py-4">{o.quantity}</td>
                          <td className="py-4">
                              {o.order_type === 'MARKET' ? 'MKT' : `₹${o.price}`}
                          </td>
                          <td className="py-4">
                              <Badge variant={o.status === 'EXECUTED' ? 'success' : o.status === 'CANCELLED' ? 'secondary' : 'warning'}>
                                  {o.status}
                              </Badge>
                          </td>
                          {canCancel && (
                              <td className="py-4 text-right">
                                  {o.status === 'PENDING' && (
                                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => cancelOrder(o.id)}>
                                          Cancel
                                      </Button>
                                  )}
                              </td>
                          )}
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        </div>

        <Tabs defaultValue="open" className="w-full">
            <TabsList>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="executed">Executed</TabsTrigger>
                <TabsTrigger value="gtt">GTT</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
                <Card>
                    <CardHeader><CardTitle>Pending Orders</CardTitle></CardHeader>
                    <CardContent>
                        <OrderTable orders={openOrders} canCancel />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="executed">
                <Card>
                    <CardHeader><CardTitle>Executed Orders</CardTitle></CardHeader>
                    <CardContent>
                         <OrderTable orders={executedOrders} />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="gtt">
                <Card>
                    <CardHeader><CardTitle>GTT Orders</CardTitle></CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground text-sm">No GTT triggers active.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default Orders;
