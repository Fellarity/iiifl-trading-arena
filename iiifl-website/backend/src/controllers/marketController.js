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
    if (!symbol.toUpperCase().endsWith('.NS')) symbol = `${symbol.toUpperCase()}.NS`;

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

    res.status(200).json({
      status: 'success',
      data: {
        symbol: symbol.replace('.NS', ''),
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
    let { interval } = req.query; 
    if (!interval) interval = '1d';
    if (!symbol.toUpperCase().endsWith('.NS')) symbol = `${symbol.toUpperCase()}.NS`;

    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const period1 = date.toISOString().split('T')[0];
    const period2 = new Date().toISOString().split('T')[0];

    let result = { quotes: [] };
    try {
        // Use chart() instead of historical()
        result = await yahooFinance.chart(symbol, { period1, period2, interval });
    } catch (e) {
        console.warn("History fetch failed:", e.message);
    }

    // result.quotes contains the candles
    const quotes = result.quotes || [];
    const candles = quotes.map(q => ({
        time: q.date.toISOString().split('T')[0],
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
    })).filter(c => c.open !== null); // Filter out empty trading days

    res.status(200).json({ status: 'success', data: { candles } });
  } catch (err) {
    res.status(200).json({ status: 'success', data: { candles: [] } });
  }
};

exports.getIndices = async (req, res, next) => {
  try {
    const symbols = ['^NSEI', '^BSESN'];
    let indices = [];
    
    for (const sym of symbols) {
        try {
            const q = await yahooFinance.quote(sym);
            if (q) {
                indices.push({
                    symbol: q.symbol,
                    name: q.symbol === '^NSEI' ? 'NIFTY 50' : 'SENSEX',
                    price: q.regularMarketPrice,
                    change: q.regularMarketChange,
                    changePercent: q.regularMarketChangePercent
                });
            }
        } catch (e) {
            indices.push({
                symbol: sym,
                name: sym === '^NSEI' ? 'NIFTY 50' : 'SENSEX',
                price: 0,
                change: 0,
                changePercent: 0
            });
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
      `SELECT w.id, a.symbol, a.name 
       FROM watchlists w 
       JOIN assets a ON w.asset_id = a.id 
       WHERE w.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
        return res.status(200).json({ status: 'success', data: { watchlist: [] } });
    }

    const symbols = result.rows.map(r => r.symbol.endsWith('.NS') ? r.symbol : `${r.symbol}.NS`);
    let priceMap = {};

    try {
        // Try batch first
        const quotes = await yahooFinance.quote(symbols);
        const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
        quotesArray.forEach(q => {
            priceMap[q.symbol.replace('.NS', '')] = {
                price: q.regularMarketPrice,
                change: q.regularMarketChange,
                percent: q.regularMarketChangePercent
            };
        });
    } catch (e) {
        console.warn("Batch quote failed, trying sequential fallback...");
        // Fallback: Fetch sequentially
        for (const sym of symbols) {
            try {
                const q = await yahooFinance.quote(sym);
                priceMap[sym.replace('.NS', '')] = {
                    price: q.regularMarketPrice,
                    change: q.regularMarketChange,
                    percent: q.regularMarketChangePercent
                };
            } catch(inner) {}
        }
    }

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
    const { assetId } = req.body;
    await db.query(
      `INSERT INTO watchlists (user_id, asset_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, assetId]
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
