import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { X, BellRing } from 'lucide-react';
import api from '../../lib/api';

const AlertModal = ({ isOpen, onClose, symbol, assetId, currentPrice }: any) => {
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [condition, setCondition] = useState('GREATER');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await api.post('/alerts', {
        assetId,
        targetPrice: Number(targetPrice),
        condition
      });
      alert(`Alert set for ${symbol} when price is ${condition} than ${targetPrice}`);
      onClose();
    } catch (err) {
      alert("Failed to set alert");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-sm shadow-2xl border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
              <BellRing size={20} className="text-primary" />
              Create Price Alert
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="bg-secondary/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold">{symbol} Current Price</div>
              <div className="text-2xl font-mono font-bold">₹{currentPrice.toLocaleString()}</div>
          </div>

          <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Alert me when price is</label>
              <select 
                className="w-full bg-background border rounded-md px-3 py-2 text-sm"
                value={condition}
                onChange={e => setCondition(e.target.value)}
              >
                  <option value="GREATER">Greater than or equal to</option>
                  <option value="LESS">Less than or equal to</option>
              </select>
          </div>

          <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Target Price</label>
              <input 
                type="number" 
                className="w-full bg-background border rounded-md px-3 py-2 text-lg font-mono"
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
              />
          </div>

          <Button 
            className="w-full py-6 text-lg font-bold mt-2"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Set Alert"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertModal;
