const { Pool } = require('pg');

const connectionString = 'postgresql://postgres.ozqkbgmehznvxycsbgsn:gusmUx-sugmi9-rahjat@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        console.log('Checking columns...');
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'repairs'");
        const cols = res.rows.map(r => r.column_name);
        console.log('Repairs Columns:', cols);
        if (cols.includes('warranty')) console.log('Has warranty');
        if (cols.includes('warranty_days')) console.log('Has warranty_days');
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
checkColumns();
