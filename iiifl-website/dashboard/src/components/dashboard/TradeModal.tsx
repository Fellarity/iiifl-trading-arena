import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../lib/api';
import { X } from 'lucide-react';

const TradeModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [assetId, setAssetId] = useState('');
  const [price, setPrice] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search Assets
  useEffect(() => {
    if (symbol.length > 1 && !assetId) {
      const delayDebounceFn = setTimeout(() => {
        api.get(`/assets/search?query=${symbol}`)
           .then(res => setSearchResults(res.data.data.assets));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [symbol, assetId]);

  const selectAsset = async (asset: any) => {
    setSymbol(asset.symbol);
    setAssetId(asset.id);
    setSearchResults([]);
    
    // Fetch Live Price
    try {
      setLoading(true);
      const res = await api.get(`/market/quote/${asset.symbol}`);
      setPrice(res.data.data.price);
    } catch (err) {
      console.error("Failed to fetch live price");
      setPrice(0);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/portfolio/${type.toLowerCase()}`, {
        assetId,
        quantity: Number(quantity),
        price // Use the live price fetched
      });
      alert(`${type} Order Executed Successfully at ₹${price}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Trade Failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrade} className="space-y-4">
            
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'BUY' ? 'bg-primary text-primary-foreground shadow' : 'hover:text-foreground text-muted-foreground'}`}
                onClick={() => setType('BUY')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'SELL' ? 'bg-destructive text-destructive-foreground shadow' : 'hover:text-foreground text-muted-foreground'}`}
                onClick={() => setType('SELL')}
              >
                Sell
              </button>
            </div>

            {/* Asset Search */}
            <div className="relative z-10">
              <label className="text-xs font-medium mb-1 block">Stock Symbol</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Search e.g. RELIANCE"
                value={symbol}
                onChange={(e) => { setSymbol(e.target.value); setAssetId(''); }}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-card border rounded-md mt-1 shadow-lg max-h-40 overflow-auto">
                  {searchResults.map(asset => (
                    <div 
                      key={asset.id} 
                      className="px-3 py-2 hover:bg-secondary cursor-pointer flex justify-between"
                      onClick={() => selectAsset(asset)}
                    >
                      <span>{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">{asset.exchange}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price (Mocked Readonly) */}
            <div>
              <label className="text-xs font-medium mb-1 block">Market Price</label>
              <div className="px-3 py-2 bg-secondary/50 rounded-md font-mono flex justify-between items-center">
                 <span>₹ {price}</span>
                 {assetId && <Badge variant="outline" className="text-[10px] h-5">Live</Badge>}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-medium mb-1 block">Quantity</label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Estimated Total</span>
              <span className="text-lg font-bold">₹ {(price * quantity).toLocaleString()}</span>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !assetId}>
              {loading ? 'Processing...' : `${type} ${symbol || 'Stock'}`}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeModal;
