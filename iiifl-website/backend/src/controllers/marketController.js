const yahooFinanceModule = require('yahoo-finance2');
const db = require('../config/db');
const AppError = require('../utils/appError');

// Helper to get a working Yahoo Finance instance
const getYahooInstance = () => {
    const YF = yahooFinanceModule.default || yahooFinanceModule;
    if (typeof YF === 'function' || (YF.prototype && YF.prototype.quote)) {
        try {
            return new YF();
        } catch (e) { 
            return YF; 
        }
    }
    return YF;
};

const yahooFinance = getYahooInstance();

exports.getQuote = async (req, res, next) => {
  try {
    let { symbol } = req.params;
    if (!symbol.startsWith('^') && !symbol.toUpperCase().endsWith('.NS')) {
        symbol = `${symbol.toUpperCase()}.NS`;
    }

    let quote;
    try {
        quote = await yahooFinance.quote(symbol);
    } catch (apiErr) {
        console.warn(`Yahoo API failed for ${symbol}: ${apiErr.message}`);
    }

    if (!quote) {
        // Mock fallback for demo if API fails entirely
        quote = {
            regularMarketPrice: 0,
            regularMarketChange: 0,
            regularMarketChangePercent: 0
        };
    }

    const symbolClean = symbol.replace('.NS', '');
    const assetRes = await db.query('SELECT id FROM assets WHERE symbol = $1', [symbolClean]);
    const assetId = assetRes.rows[0]?.id;

    res.status(200).json({
      status: 'success',
      data: {
        id: assetId,
        symbol: symbolClean,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        open: quote.regularMarketOpen,
        prevClose: quote.regularMarketPreviousClose
      },
    });
  } catch (err) {
    // Never crash
    console.error("Market Controller Error:", err);
    res.status(200).json({ status: 'success', data: { price: 0 } });
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    let { symbol } = req.params;
    let { range } = req.query; // 1d, 1w, 1m, 3m
    
    if (!symbol.startsWith('^') && !symbol.toUpperCase().endsWith('.NS')) {
        symbol = `${symbol.toUpperCase()}.NS`;
    }

    let interval = '1d';
    const startDate = new Date();

    // Calculate start date and interval based on range
    switch (range) {
        case '1d':
            startDate.setDate(startDate.getDate() - 2); // Go back 2 days to ensure we get full trading day data even on weekends/start of day
            interval = '5m'; 
            break;
        case '1w':
            startDate.setDate(startDate.getDate() - 7);
            interval = '1h';
            break;
        case '1m':
            startDate.setMonth(startDate.getMonth() - 1);
            interval = '1d';
            break;
        case '3m':
        default:
            startDate.setMonth(startDate.getMonth() - 3);
            interval = '1d';
            break;
    }

    let result = { quotes: [] };
    try {
        // period1 can be a Date object or string
        result = await yahooFinance.chart(symbol, { period1: startDate, interval });
    } catch (e) {
        console.warn("History fetch failed:", e.message);
    }

    // result.quotes contains the candles
    const quotes = result.quotes || [];
    const candles = quotes.map(q => ({
        time: q.date, // Keep full date object/string for intraday
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
    })).filter(c => c.open !== null); 

    res.status(200).json({ status: 'success', data: { candles } });
  } catch (err) {
    res.status(200).json({ status: 'success', data: { candles: [] } });
  }
};

exports.getIndices = async (req, res, next) => {
  try {
    const symbols = ['^NSEI', '^BSESN', '^NSEBANK', '^GSPC', '^IXIC'];
    let indices = [];
    
    for (const sym of symbols) {
        try {
            const q = await yahooFinance.quote(sym);
            if (q) {
                let name = sym;
                if (sym === '^NSEI') name = 'NIFTY 50';
                else if (sym === '^BSESN') name = 'SENSEX';
                else if (sym === '^NSEBANK') name = 'BANK NIFTY';
                else if (sym === '^GSPC') name = 'S&P 500';
                else if (sym === '^IXIC') name = 'NASDAQ';

                indices.push({
                    symbol: q.symbol,
                    name: name,
                    price: q.regularMarketPrice,
                    change: q.regularMarketChange,
                    changePercent: q.regularMarketChangePercent
                });
            }
        } catch (e) {
             // Skip or push zero
        }
    }

    res.status(200).json({ status: 'success', data: { indices } });
  } catch (err) {
    res.status(200).json({ status: 'success', data: { indices: [] } });
  }
};

exports.getWatchlist = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT w.id, a.symbol, a.name, w.tag 
       FROM watchlists w 
       JOIN assets a ON w.asset_id = a.id 
       WHERE w.user_id = $1`,
      [req.user.id]
    );

    // ... (rest of logic same, but include tag in map)
    if (result.rows.length === 0) {
        return res.status(200).json({ status: 'success', data: { watchlist: [] } });
    }

    const symbols = result.rows.map(r => r.symbol.endsWith('.NS') ? r.symbol : `${r.symbol}.NS`);
    let priceMap = {};

    try {
        const quotes = await yahooFinance.quote(symbols);
        const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
        quotesArray.forEach(q => {
            priceMap[q.symbol.replace('.NS', '')] = {
                price: q.regularMarketPrice,
                change: q.regularMarketChange,
                percent: q.regularMarketChangePercent
            };
        });
    } catch (e) {}

    const watchlist = result.rows.map(r => {
        const market = priceMap[r.symbol] || { price: 0, change: 0, percent: 0 };
        return { ...r, ...market };
    });

    res.status(200).json({ status: 'success', data: { watchlist } });
  } catch (err) {
    console.error("Watchlist Error:", err);
    res.status(200).json({ status: 'success', data: { watchlist: [] } });
  }
};

exports.addToWatchlist = async (req, res, next) => {
  try {
    const { assetId, tag } = req.body;
    await db.query(
      `INSERT INTO watchlists (user_id, asset_id, tag) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [req.user.id, assetId, tag || 'Favorites']
    );
    res.status(200).json({ status: 'success', message: 'Added to watchlist' });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
        `DELETE FROM watchlists WHERE id = $1 AND user_id = $2`,
        [id, req.user.id]
    );
    res.status(200).json({ status: 'success', message: 'Removed from watchlist' });
  } catch (err) {
    next(err);
  }
};

exports.getMovers = async (req, res, next) => {
  try {
    const symbols = [
        'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
        'TATAMOTORS.NS', 'SBIN.NS', 'ADANIENT.NS', 'BAJFINANCE.NS', 'ASIANPAINT.NS',
        'AXISBANK.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'WIPRO.NS', 'ITC.NS',
        'MARUTI.NS', 'ULTRACEMCO.NS', 'TECHM.NS', 'LT.NS', 'KOTAKBANK.NS'
    ];

    let data = [];
    try {
        const quotes = await yahooFinance.quote(symbols);
        const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
        data = quotesArray.map(q => ({
            symbol: q.symbol.replace('.NS', ''),
            name: q.shortName || q.symbol,
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent
        }));
    } catch (e) {
        console.error("Movers Yahoo Error:", e.message);
    }

    // Sort by Change Percent
    data.sort((a, b) => b.changePercent - a.changePercent);

    const gainers = data.slice(0, 5);
    const losers = data.slice(-5).reverse(); 

    res.status(200).json({ status: 'success', data: { gainers, losers } });
  } catch (err) {
    console.error("Movers Controller Error:", err);
    res.status(200).json({ status: 'success', data: { gainers: [], losers: [] } });
  }
};

exports.getNews = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const searchRes = await yahooFinance.search(symbol);
    
    // Yahoo search returns news in searchRes.news
    const news = (searchRes.news || []).map(item => ({
        id: item.uuid,
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        providerPublishTime: item.providerPublishTime,
        thumbnail: item.thumbnail?.resolutions?.[0]?.url
    }));

    res.status(200).json({ status: 'success', data: { news } });
  } catch (err) {
    console.error("News Error:", err);
    res.status(200).json({ status: 'success', data: { news: [] } });
  }
};
