const db = require('./src/config/db');

const run = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        asset_id UUID REFERENCES assets(id),
        type VARCHAR(10) NOT NULL,
        product_type VARCHAR(10) DEFAULT 'CNC',
        order_type VARCHAR(10) DEFAULT 'MARKET',
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2),
        trigger_price DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Orders table created!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
