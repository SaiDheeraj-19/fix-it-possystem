import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        // Allow both Admin and Staff to mark payment collected
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Ensure column exists
        try {
            await query('ALTER TABLE repairs ADD COLUMN IF NOT EXISTS balance_collected_at TIMESTAMP');
        } catch (e) {
            // Ignore
        }

        await query(
            'UPDATE repairs SET balance_collected_at = NOW() WHERE id = $1',
            [params.id]
        );

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Collect Balance Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
