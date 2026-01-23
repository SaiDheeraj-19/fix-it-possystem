const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sales';
        `);
        console.log("Sales Columns:", res.rows.map(r => r.column_name));

        const repairs = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'repairs';
        `);
        console.log("Repairs Columns:", repairs.rows.map(r => r.column_name));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkSchema();
