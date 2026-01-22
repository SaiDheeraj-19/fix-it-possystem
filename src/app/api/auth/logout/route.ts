import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        cookies().delete('session_token');
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}

export async function GET() {
    try {
        cookies().delete('session_token');
        // Redirect to login page
        return NextResponse.redirect(new URL('/', 'http://localhost:3000'));
    } catch (err) {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
