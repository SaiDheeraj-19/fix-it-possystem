import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const validStatuses = ['NEW', 'PENDING', 'REPAIRED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await query(
            'UPDATE repairs SET status = $1 WHERE id = $2',
            [status, params.id]
        );

        return NextResponse.json({ success: true, status });

    } catch (err: any) {
        console.error('Update Status Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
