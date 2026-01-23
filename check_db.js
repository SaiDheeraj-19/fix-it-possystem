const { Client } = require('pg');

async function check() {
    const client = new Client({
        connectionString: "postgresql://postgres.ozqkbgmehznvxycsbgsn:gusmUx-sugmi9-rahjat@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));

        const inv = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices'");
        console.log('Invoice columns:', inv.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
