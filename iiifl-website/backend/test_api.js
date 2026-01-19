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

    console.log("2. Fetching Orders...");
    const ordersRes = await fetch('http://localhost:5000/api/orders?status=open', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const ordersData = await ordersRes.json();
    if (!ordersRes.ok) throw new Error(JSON.stringify(ordersData));
    console.log(`✅ Orders Fetch Success. Count: ${ordersData.data.orders.length}`);

    console.log("3. Fetching Indices...");
    const indicesRes = await fetch('http://localhost:5000/api/market/indices', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const indicesData = await indicesRes.json();
    if (!indicesRes.ok) throw new Error(JSON.stringify(indicesData));
    console.log(`✅ Indices Fetch Success. Count: ${indicesData.data.indices.length}`);
    console.log("Indices:", indicesData.data.indices.map(i => i.name).join(', '));

  } catch (err) {
    console.error("❌ Test Failed:", err.message);
  }
};

test();