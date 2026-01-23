const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function checkIndexes() {
    try {
        const res = await pool.query(`
            SELECT tablename, indexname, indexdef 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            ORDER BY tablename, indexname;
        `);
        console.log("Indexes found:");
        res.rows.forEach(r => {
            console.log(`[${r.tablename}] ${r.indexname}: ${r.indexdef}`);
        });
    } catch (err) {
        console.error("Error query indexes:", err);
    } finally {
        await pool.end();
    }
}

checkIndexes();
