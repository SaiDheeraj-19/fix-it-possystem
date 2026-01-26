const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://saidheeraj:@localhost:5432/fixit_pos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function updateSchema() {
    try {
        console.log("Updating users table role constraint...");

        // 1. Drop existing constraint
        await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

        // 2. Add new constraint including TECH_BRO
        await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'STAFF', 'TECH_BRO'))");

        console.log("Constraint updated.");

        // 3. Insert Tech Bro user
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('techbro123', salt); // Default password

        // ID generation (simple one since we don't have uuid lib here, but assuming db can handle it or use a query)
        // Actually the schema in login route uses gen_random_uuid(), but older schema used serial.
        // Let's check schema.sql again.
        // schema.sql says "id SERIAL PRIMARY KEY". 
        // login route says "id UUID PRIMARY KEY DEFAULT gen_random_uuid()".
        // Using "id SERIAL" is simpler if existing db is serial.
        // Let's try inserting without ID and let serial/gen_random_uuid handle it.
        // But login route generates ID manually. 
        // I will use a simple query that works for both (letting DB default).

        console.log("Creating Tech Bro user...");
        await pool.query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ('techbro', $1, 'TECH_BRO')
            ON CONFLICT (username) DO UPDATE SET role = 'TECH_BRO', password_hash = $1
        `, [hash]);

        console.log("Tech Bro user created: username='techbro', password='techbro123'");

    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        await pool.end();
    }
}

updateSchema();
