const db = require('./src/config/db');

const run = async () => {
  try {
    await db.query(`ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT 'Favorites';`);
    console.log("Watchlists updated!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
