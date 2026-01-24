const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function addPaymentModeToRepairs() {
    try {
        await pool.query(`
            ALTER TABLE repairs 
            ADD COLUMN IF NOT EXISTS payment_mode_advance TEXT DEFAULT 'CASH',
            ADD COLUMN IF NOT EXISTS payment_mode_balance TEXT DEFAULT 'CASH';
        `);
        console.log("Added payment_mode columns to repairs table.");
    } catch (err) {
        console.error("Error altering repairs table:", err);
    } finally {
        await pool.end();
    }
}

addPaymentModeToRepairs();
