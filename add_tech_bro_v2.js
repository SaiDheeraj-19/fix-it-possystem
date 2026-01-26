const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function updateSchema() {
    try {
        console.log("Updating users table...");

        // 1. Try to add constraint (might fail if data violates it, but we assume clean-ish state)
        // First, let's see if we need to drop an old one.
        // Assuming table uses 'name' and 'email' based on route.ts

        // We will try to add the Tech Bro user first, handling the 'username' vs 'name' ambiguity by checking columns or just trying generic insert.

        // Let's just assume the 'name'/'email' schema from route.ts is the source of truth since the previous run failed on 'username'

        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('techbro123', salt);

        console.log("Inserting Tech Bro user...");
        // using ON CONFLICT (email) since it's unique in route.ts
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ('Tech Bro', 'techbro@fixit.com', $1, 'TECH_BRO')
            ON CONFLICT (email) DO UPDATE SET role = 'TECH_BRO', password_hash = $1
        `;

        await pool.query(query, [hash]);
        console.log("Tech Bro user created!");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

updateSchema();
