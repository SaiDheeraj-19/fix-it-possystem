const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function addIndexes() {
    const queries = [
        "CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);",
        "CREATE INDEX IF NOT EXISTS idx_repairs_created_at ON repairs(created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_repairs_customer_phone ON repairs(customer_phone);",
        "CREATE INDEX IF NOT EXISTS idx_repairs_customer_name ON repairs(customer_name);",
        "CREATE INDEX IF NOT EXISTS idx_repairs_imei ON repairs(imei);"
    ];

    try {
        for (const query of queries) {
            console.log("Executing:", query);
            await pool.query(query);
            console.log("Success.");
        }
        console.log("All indexes added successfully.");
    } catch (err) {
        console.error("Error adding indexes:", err);
    } finally {
        await pool.end();
    }
}

addIndexes();
