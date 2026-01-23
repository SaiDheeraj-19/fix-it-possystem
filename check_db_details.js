const { Client } = require('pg');

async function check() {
    const client = new Client({
        connectionString: "postgresql://postgres.ozqkbgmehznvxycsbgsn:gusmUx-sugmi9-rahjat@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'invoices'
        `);
        console.log('Invoice columns:', res.rows);

        const res2 = await client.query("SELECT * FROM invoices LIMIT 5");
        console.log('Recent invoices:', res2.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
