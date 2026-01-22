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

export async function GET(request: Request) {
    try {
        cookies().delete('session_token');
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
    } catch (err) {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
