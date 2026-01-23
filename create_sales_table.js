const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function createSalesTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                item_name TEXT NOT NULL,
                category TEXT DEFAULT 'Accessories',
                quantity INTEGER DEFAULT 1,
                price_per_unit NUMERIC NOT NULL,
                total_price NUMERIC NOT NULL,
                customer_name TEXT,
                customer_phone TEXT,
                created_by TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Sales table created/verified.");

        // Add index for category for faster stats
        await pool.query("CREATE INDEX IF NOT EXISTS idx_sales_category ON sales(category);");
        await pool.query("CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);");
        console.log("Sales indexes created.");

    } catch (err) {
        console.error("Error creating sales table:", err);
    } finally {
        await pool.end();
    }
}

createSalesTable();
