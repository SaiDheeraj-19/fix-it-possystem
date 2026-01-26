import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signSession } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const generateId = () => globalThis.crypto.randomUUID();

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

        // Helper to upsert auto-seeded users
        const upsertUser = async (name: string, email: string, pass: string, role: string) => {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(pass, salt);
            const check = await query("SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($2)", [email, name]);
            if (check.rowCount === 0) {
                await query(
                    "INSERT INTO users (id, name, email, password_hash, password_plain, role) VALUES ($1, $2, $3, $4, $5, $6)",
                    [generateId(), name, email, hash, pass, role]
                );
            } else {
                await query(
                    "UPDATE users SET name = $1, password_hash = $2, password_plain = $3, role = $4 WHERE id = $5",
                    [name, hash, pass, role, check.rows[0].id]
                );
            }
        };

        // Auto-seed admin on first run
        if (userCount === 0 && username.toLowerCase() === 'admin') {
            await upsertUser('admin', 'admin@fixit.com', password, 'ADMIN');
            await upsertUser('staff', 'staff@fixit.com', 'staff123', 'STAFF');
        }

        // Auto-seed staff if logging in as staff on empty DB
        if (userCount === 0 && username.toLowerCase() === 'staff') {
            await upsertUser('admin', 'admin@fixit.com', 'admin123', 'ADMIN');
            await upsertUser('staff', 'staff@fixit.com', password, 'STAFF');
        }

        // Auto-Fix / Seed Admin (Dinesh)
        if (username.toLowerCase() === 'dinesh' && password === 'dineshceo@fixit-3') {
            await upsertUser('dinesh', 'dinesh@fixit.com', password, 'ADMIN');
        }

        // Auto-Fix / Seed Staff
        if (username.toLowerCase() === 'staff' && password === 'staff@fixit-3') {
            await upsertUser('staff', 'staff@fixit.com', password, 'STAFF');
        }

        // Auto-Fix / Seed Tech
        if (username.toLowerCase() === 'tech' && password === 'tech@fixit') {
            await upsertUser('tech', 'tech@fixit.com', password, 'ADMIN');
        }

        // Auto-Fix / Seed Tstaff
        if (username.toLowerCase() === 'tstaff' && password === 'tstaff@fixit') {
            await upsertUser('tstaff', 'tstaff@fixit.com', password, 'STAFF');
        }



        // Fetch user by name or email (Case Insensitive)
        const result = await query(
            'SELECT * FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1)',
            [username]
        );

        if (result && (result.rowCount ?? 0) === 0) {
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
