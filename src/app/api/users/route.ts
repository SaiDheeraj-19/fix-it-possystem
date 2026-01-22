import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        return NextResponse.json({ users: result.rows });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            [name, email, hash, role]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e.code === '23505') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
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
