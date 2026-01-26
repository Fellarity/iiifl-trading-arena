const db = require('./src/config/db');

const run = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        asset_id UUID REFERENCES assets(id),
        target_price NUMERIC(15, 2) NOT NULL,
        condition VARCHAR(10) DEFAULT 'GREATER', -- GREATER, LESS
        status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, TRIGGERED, CANCELLED
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Alerts table created!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
