import { Bell, Check, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    title: "Welcome to iiifl Pro",
    message: "Your account has been successfully created. Start trading now!",
    time: "2 hrs ago",
    read: false,
    type: "info"
  },
  {
    id: 2,
    title: "Market Alert",
    message: "NIFTY 50 crossed 22,000 mark today.",
    time: "5 hrs ago",
    read: false,
    type: "alert"
  },
  {
    id: 3,
    title: "Order Executed",
    message: "Buy order for 10 TCS @ 3890 completed.",
    time: "1 day ago",
    read: true,
    type: "success"
  }
];

export const NotificationDropdown = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <Card className="absolute top-16 right-4 w-80 z-50 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
          <div className="flex gap-2">
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark read</button>
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline">Clear</button>
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[400px] overflow-auto">
          {notifications.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground text-sm">
                No new notifications.
             </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div>
                    <h4 className="text-sm font-medium leading-none mb-1">{n.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
};
