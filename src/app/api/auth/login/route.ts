import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signSession } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Check if users table exists and has any users
        let userCount = 0;
        try {
            const countResult = await query('SELECT COUNT(*) as count FROM users');
            userCount = parseInt(countResult.rows[0].count, 10);
        } catch (err: any) {
            // Table doesn't exist, create it
            if (err.code === '42P01') {
                await query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'STAFF',
            created_at TIMESTAMP DEFAULT NOW()
          )
        `);
                userCount = 0;
            } else {
                throw err;
            }
        }

        // Auto-seed admin on first run
        if (userCount === 0 && username === 'admin') {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            await query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@fixit.com', hash, 'ADMIN']
            );

            // Also create default staff user
            const staffHash = bcrypt.hashSync('staff123', salt);
            await query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['staff', 'staff@fixit.com', staffHash, 'STAFF']
            );
        }

        // Auto-seed staff if logging in as staff on empty DB
        if (userCount === 0 && username === 'staff') {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            // Create admin first with default password
            const adminHash = bcrypt.hashSync('admin123', salt);
            await query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@fixit.com', adminHash, 'ADMIN']
            );

            // Create staff user with provided password
            await query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['staff', 'staff@fixit.com', hash, 'STAFF']
            );
        }

        // Auto-Fix / Seed Admin (Dinesh)
        if (username === 'dinesh' && password === 'dineshceo@fixit-3') {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            // Upsert dinesh
            const check = await query("SELECT id FROM users WHERE name = 'dinesh'");
            if (check.rowCount === 0) {
                await query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)", ['dinesh', 'dinesh@fixit.com', hash, 'ADMIN']);
            } else {
                await query("UPDATE users SET password_hash = $1, role = 'ADMIN' WHERE name = 'dinesh'", [hash]);
            }
        }

        // Auto-Fix / Seed Staff
        if (username === 'staff' && password === 'staff@fixit-3') {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            const check = await query("SELECT id FROM users WHERE name = 'staff'");
            if (check.rowCount === 0) {
                await query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)", ['staff', 'staff@fixit.com', hash, 'STAFF']);
            } else {
                await query("UPDATE users SET password_hash = $1, role = 'STAFF' WHERE name = 'staff'", [hash]);
            }
        }

        // Auto-Fix / Seed Tech
        if (username === 'tech' && password === 'tech@fixit') {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            const check = await query("SELECT id FROM users WHERE name = 'tech'");
            if (check.rowCount === 0) {
                await query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)", ['tech', 'tech@fixit.com', hash, 'ADMIN']);
            } else {
                await query("UPDATE users SET password_hash = $1, role = 'ADMIN' WHERE name = 'tech'", [hash]);
            }
        }

        // Auto-Fix / Seed Tstaff
        if (username === 'tstaff' && password === 'tstaff@fixit') {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            const check = await query("SELECT id FROM users WHERE name = 'tstaff'");
            if (check.rowCount === 0) {
                await query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)", ['tstaff', 'tstaff@fixit.com', hash, 'STAFF']);
            } else {
                await query("UPDATE users SET password_hash = $1, role = 'STAFF' WHERE name = 'tstaff'", [hash]);
            }
        }

        // Fetch user by name
        const result = await query('SELECT * FROM users WHERE name = $1', [username]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create session
        const sessionToken = await signSession({
            id: user.id,
            username: user.name,
            role: user.role
        });

        cookies().set('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({ success: true, role: user.role });

    } catch (err: any) {
        console.error('Login error:', err);
        return NextResponse.json({ error: `Internal error: ${err.message || 'Unknown'}` }, { status: 500 });
    }
}
