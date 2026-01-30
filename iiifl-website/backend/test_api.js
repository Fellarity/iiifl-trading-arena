const test = async () => {
  try {
    console.log("1. Logging in...");
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'trader@iiifl.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    
    const token = loginData.token;
    console.log("✅ Login Success");

    console.log("2. Fetching Movers...");
    const moversRes = await fetch('http://localhost:5000/api/market/movers', {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!moversRes.ok) {
        const err = await moversRes.text();
        throw new Error(`Movers Failed: ${err}`);
    }
    
    const moversData = await moversRes.json();
    console.log(`✅ Movers Fetch Success.`);
    console.log(`Gainers: ${moversData.data.gainers.length}, Losers: ${moversData.data.losers.length}`);

  } catch (err) {
    console.error("❌ Test Failed:", err.message);
  }
};

test();