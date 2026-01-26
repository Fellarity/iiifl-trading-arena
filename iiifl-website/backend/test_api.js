const test = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  let token = '';

  const log = (msg, type = 'INFO') => {
      const icons = { INFO: 'ℹ️', SUCCESS: '✅', ERROR: '❌', WARN: '⚠️' };
      console.log(`${icons[type]} ${msg}`);
  };

  try {
    // 1. Authentication
    log("Testing Authentication...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'trader@iiifl.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Login Failed: ${JSON.stringify(loginData)}`);
    token = loginData.token;
    log("Authentication System: Operational", 'SUCCESS');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Market Data
    log("Testing Market Data Feeds...");
    const quoteRes = await fetch(`${BASE_URL}/market/quote/RELIANCE`, { headers });
    const quoteData = await quoteRes.json();
    if (!quoteData.data.id) log("Asset ID missing in Quote (Critical for Alerts/Orders)", 'ERROR');
    else log(`Live Quote: RELIANCE @ ₹${quoteData.data.price}`, 'SUCCESS');

    const newsRes = await fetch(`${BASE_URL}/market/news/RELIANCE`, { headers });
    const newsData = await newsRes.json();
    log(`News Feed: Fetched ${newsData.data.news.length} articles`, 'SUCCESS');

    // 3. Orders & Portfolio
    log("Testing Order Management...");
    const ordersRes = await fetch(`${BASE_URL}/orders?status=open`, { headers });
    const ordersData = await ordersRes.json();
    log(`Orders Book: ${ordersData.data.orders.length} open orders found`, 'SUCCESS');

    const holdingsRes = await fetch(`${BASE_URL}/portfolio`, { headers });
    const holdingsData = await holdingsRes.json();
    log(`Portfolio: Total Value ₹${holdingsData.data.summary.total_portfolio_value}`, 'SUCCESS');

    // 4. Alerts
    log("Testing Alert System...");
    const alertsRes = await fetch(`${BASE_URL}/alerts`, { headers });
    const alertsData = await alertsRes.json();
    log(`Alerts: ${alertsData.data.alerts.length} active alerts`, 'SUCCESS');

    // 5. Watchlist
    log("Testing Watchlist...");
    const wlRes = await fetch(`${BASE_URL}/market/watchlist`, { headers });
    const wlData = await wlRes.json();
    log(`Watchlist: ${wlData.data.watchlist.length} items synced`, 'SUCCESS');

  } catch (err) {
    log(`System Check Failed: ${err.message}`, 'ERROR');
  }
};

test();
