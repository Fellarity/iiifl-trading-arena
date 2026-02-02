import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { X, Search, Info } from 'lucide-react';
import api from '../../lib/api';

const TradeModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [triggerPrice, setTriggerPrice] = useState("0");
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'SL'>('MARKET');
  const [productType, setProductType] = useState<'CNC' | 'MIS'>('CNC');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [loading, setLoading] = useState(false);

  // Search Logic
  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounceFn = setTimeout(() => {
        api.get(`/assets/search?query=${searchQuery}`)
           .then(res => setSearchResults(res.data.data.assets));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
        setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelect = (asset: any) => {
      setSelectedAsset(asset);
      setSearchQuery("");
      setSearchResults([]);
      // Fetch live price to pre-fill
      api.get(`/market/quote/${asset.symbol}`).then(res => {
          setPrice(res.data.data.price.toString());
          setTriggerPrice((res.data.data.price * 0.95).toFixed(2)); // Default trigger 5% below
      });
  };

  const handleTrade = async () => {
    if (!selectedAsset) return;
    setLoading(true);
    try {
      // Use the unified Orders endpoint
      await api.post('/orders', {
        assetId: selectedAsset.id,
        type: tradeType,
        productType,
        orderType,
        quantity: Number(quantity),
        price: orderType === 'MARKET' ? null : Number(price),
        triggerPrice: orderType === 'SL' ? Number(triggerPrice) : null
      });
      
      alert(`Order Placed: ${tradeType} ${quantity} ${selectedAsset.symbol} (${orderType})`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex gap-4">
              <button 
                onClick={() => setTradeType('BUY')} 
                className={`text-lg font-bold pb-1 border-b-2 transition-colors ${tradeType === 'BUY' ? 'text-emerald-500 border-emerald-500' : 'text-muted-foreground border-transparent'}`}
              >
                  BUY
              </button>
              <button 
                onClick={() => setTradeType('SELL')} 
                className={`text-lg font-bold pb-1 border-b-2 transition-colors ${tradeType === 'SELL' ? 'text-red-500 border-red-500' : 'text-muted-foreground border-transparent'}`}
              >
                  SELL
              </button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Asset Selector */}
          {!selectedAsset ? (
            <div className="relative">
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-ring-primary/50">
                <Search size={18} className="text-muted-foreground" />
                <input 
                  autoFocus
                  className="bg-transparent outline-none w-full"
                  placeholder="Search instrument (e.g. RELIANCE)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-card border rounded-md mt-1 shadow-xl z-50 max-h-60 overflow-auto">
                    {searchResults.map(asset => (
                        <div key={asset.id} className="p-3 hover:bg-secondary cursor-pointer flex justify-between" onClick={() => handleSelect(asset)}>
                            <span className="font-bold">{asset.symbol}</span>
                            <span className="text-xs text-muted-foreground">{asset.exchange}</span>
                        </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg">
                <div>
                    <div className="font-bold text-lg">{selectedAsset.symbol}</div>
                    <div className="text-xs text-muted-foreground">{selectedAsset.name}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>Change</Button>
            </div>
          )}

          {/* Product Type */}
          <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setProductType('CNC')}
                className={`py-2 px-4 rounded-md text-sm font-medium border transition-all ${productType === 'CNC' ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-muted-foreground'}`}
              >
                  Longterm <span className="text-[10px] block opacity-70">CNC</span>
              </button>
              <button 
                onClick={() => setProductType('MIS')}
                className={`py-2 px-4 rounded-md text-sm font-medium border transition-all ${productType === 'MIS' ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-muted-foreground'}`}
              >
                  Intraday <span className="text-[10px] block opacity-70">MIS</span>
              </button>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Qty</label>
                  <input 
                    type="number" 
                    className="w-full bg-background border rounded-md px-3 py-2 text-lg font-mono"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Price</label>
                  <input 
                    type="number" 
                    disabled={orderType === 'MARKET'}
                    className={`w-full border rounded-md px-3 py-2 text-lg font-mono ${orderType === 'MARKET' ? 'bg-secondary cursor-not-allowed opacity-50' : 'bg-background'}`}
                    value={orderType === 'MARKET' ? "" : price}
                    placeholder={orderType === 'MARKET' ? "Market" : "0.00"}
                    onChange={e => setPrice(e.target.value)}
                  />
              </div>
          </div>

          {/* Order Types */}
          <div className="flex bg-secondary/50 p-1 rounded-lg gap-1">
              {['MARKET', 'LIMIT', 'SL'].map((t: any) => (
                  <button 
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${orderType === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                      {t}
                  </button>
              ))}
          </div>

          {/* Trigger Price (Only for SL) */}
          {orderType === 'SL' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Trigger Price</label>
                  <input 
                    type="number" 
                    className="w-full bg-background border rounded-md px-3 py-2 text-lg font-mono"
                    value={triggerPrice}
                    onChange={e => setTriggerPrice(e.target.value)}
                  />
              </div>
          )}

          {/* Order Summary */}
          <div className="pt-4 border-t border-dashed">
              <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approx. Margin</span>
                  <span className="font-bold">₹{(Number(quantity) * (orderType === 'MARKET' ? Number(price) || 0 : Number(price))).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span className="flex items-center gap-1"><Info size={12} /> Charges</span>
                  <span>₹0.00</span>
              </div>
          </div>

          <Button 
            onClick={handleTrade} 
            disabled={loading || !selectedAsset}
            className={`w-full py-6 text-lg font-bold transition-all ${tradeType === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Processing...' : `${tradeType} ${selectedAsset?.symbol || ''}`}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default TradeModal;