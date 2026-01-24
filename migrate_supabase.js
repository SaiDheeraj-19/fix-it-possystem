const { Pool } = require('pg');

const connectionString = "postgresql://postgres.ozqkbgmehznvxycsbgsn:gusmUx-sugmi9-rahjat@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase usually
});

async function runMigration() {
    try {
        console.log("Connecting to Supabase...");

        // 1. Update SALES table
        console.log("Updating SALES table...");
        await pool.query(`
            ALTER TABLE sales 
            ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'CASH';
        `);
        console.log("Added payment_mode to sales.");

        // 2. Update REPAIRS table
        console.log("Updating REPAIRS table...");
        await pool.query(`
            ALTER TABLE repairs 
            ADD COLUMN IF NOT EXISTS payment_mode_advance TEXT DEFAULT 'CASH',
            ADD COLUMN IF NOT EXISTS payment_mode_balance TEXT DEFAULT 'CASH';
        `);
        console.log("Added payment_mode columns to repairs.");

    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await pool.end();
        console.log("Done.");
    }
}

runMigration();
