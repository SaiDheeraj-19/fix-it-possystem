const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: "postgresql://postgres.ozqkbgmehznvxycsbgsn:gusmUx-sugmi9-rahjat@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    });
    try {
        await client.connect();

        console.log('Altering invoices table...');

        // Change warranty_days to TEXT
        await client.query("ALTER TABLE invoices ALTER COLUMN warranty_days TYPE TEXT USING warranty_days::text");

        // Change repair_id to TEXT
        await client.query("ALTER TABLE invoices ALTER COLUMN repair_id TYPE TEXT USING repair_id::text");

        // Change created_by to TEXT
        await client.query("ALTER TABLE invoices ALTER COLUMN created_by TYPE TEXT USING created_by::text");

        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await client.end();
    }
}
migrate();
