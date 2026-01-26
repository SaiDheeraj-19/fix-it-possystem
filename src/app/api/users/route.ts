import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const session = await getSession();
        // Allow ADMIN and TECH_BRO
        if (!session || (session.role !== 'ADMIN' && session.role !== 'TECH_BRO')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Try to add column if not exists (lazy migration)
        try { await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_plain TEXT'); } catch (e) { }

        // If ADMIN, do not show TECH_BRO users
        let sql = 'SELECT id, name, email, role, password_plain, created_at FROM users';
        const params: any[] = [];

        if (session.role === 'ADMIN') {
            sql += " WHERE role != 'TECH_BRO'";
        }

        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);
        return NextResponse.json({ users: result.rows });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        await query(
            'INSERT INTO users (id, name, email, password_hash, password_plain, role) VALUES ($1, $2, $3, $4, $5, $6)',
            [globalThis.crypto.randomUUID(), name, email, hash, password, role]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e.code === '23505') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id, password } = await request.json();
        if (!id || !password) return NextResponse.json({ error: 'Missing ID or password' }, { status: 400 });

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        await query('UPDATE users SET password_hash = $1, password_plain = $2 WHERE id = $3', [hash, password, id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        if (id === session.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });

        await query('DELETE FROM users WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
