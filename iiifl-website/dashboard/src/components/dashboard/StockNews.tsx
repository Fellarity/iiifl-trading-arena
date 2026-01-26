import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Newspaper, ExternalLink } from "lucide-react";
import api from "../../lib/api";

const StockNews = ({ symbol }: { symbol: string }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
        try {
            const res = await api.get(`/market/news/${symbol}`);
            setNews(res.data.data.news);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchNews();
  }, [symbol]);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading news...</div>;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper size={20} className="text-primary" />
            Latest Headlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent news found for {symbol}.</p>
        ) : (
            news.map((item) => (
                <a 
                    key={item.id} 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex gap-4 group p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                >
                    {item.thumbnail && (
                        <img 
                            src={item.thumbnail} 
                            alt="news" 
                            className="w-20 h-20 object-cover rounded border border-border" 
                        />
                    )}
                    <div className="flex-1">
                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground uppercase font-medium">
                            <span>{item.publisher}</span>
                            <span>•</span>
                            <span>{new Date(item.providerPublishTime * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
            ))
        )}
      </CardContent>
    </Card>
  );
};

export default StockNews;
