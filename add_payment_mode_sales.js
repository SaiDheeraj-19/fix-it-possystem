const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function addPaymentMode() {
    try {
        await pool.query(`
            ALTER TABLE sales 
            ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'CASH';
        `);
        console.log("Added payment_mode column to sales table.");
    } catch (err) {
        console.error("Error altering sales table:", err);
    } finally {
        await pool.end();
    }
}

addPaymentMode();
