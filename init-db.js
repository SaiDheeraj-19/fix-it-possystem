const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
    // 1. Connect to default 'postgres' database to create the new DB
    const client = new Client({
        user: process.env.DB_USER || 'saidheeraj',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('Connected to postgres default DB.');

        // Check if DB exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='fixit_pos'");
        if (res.rowCount === 0) {
            console.log('Database fixit_pos does not exist. Creating...');
            await client.query('CREATE DATABASE fixit_pos');
            console.log('Database created.');
        } else {
            console.log('Database fixit_pos already exists.');
        }
    } catch (e) {
        console.error('Error creating database:', e.message);
        if (e.message.includes('does not exist')) {
            console.log("Try checking if your system username matches the DB user.");
        }
    } finally {
        await client.end();
    }

    // 2. Connect to the NEW database to run schema
    const pool = new Client({
        user: process.env.DB_USER || 'saidheeraj',
        host: process.env.DB_HOST || 'localhost',
        database: 'fixit_pos',
        password: process.env.DB_PASSWORD || 'postgres',
        port: 5432,
    });

    try {
        await pool.connect();
        console.log('Connected to fixit_pos.');

        const schemaPath = path.join(__dirname, 'src', 'lib', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log('Schema applied successfully.');

    } catch (e) {
        console.error('Error applying schema:', e);
    } finally {
        await pool.end();
    }
}

setup();
