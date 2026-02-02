import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import api from "../../lib/api";

export const NotificationDropdown = ({ onClose: _onClose, onRead }: { onClose: () => void, onRead?: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
      try {
          await api.put('/notifications/read');
          fetchNotifications();
          if (onRead) onRead();
      } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="absolute top-14 right-0 w-80 bg-card border rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between p-4 border-b">
        <h4 className="font-semibold">Notifications</h4>
        {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={markAllRead}>
                Mark all read
            </Button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Bell size={24} className="mb-2 opacity-50" />
                <p>No notifications</p>
            </div>
        ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 border-b last:border-0 hover:bg-secondary/50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex justify-between items-start gap-2">
                    <h5 className="text-sm font-medium">{notif.title}</h5>
                    {!notif.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                    {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
