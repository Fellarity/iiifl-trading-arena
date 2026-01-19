const db = require('./src/config/db');

const run = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        asset_id UUID REFERENCES assets(id),
        quantity NUMERIC(15, 2) NOT NULL,
        average_price NUMERIC(15, 2) NOT NULL,
        product_type VARCHAR(10) DEFAULT 'MIS',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Positions table created!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();