import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        // Only Admin can delete? User didn't specify, but usually safe. 
        // "add delete the repair" - let's allow Admin and maybe Staff if they made a mistake recently?
        // Let's stick to Admin for safety, or return error if not authorized.
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Only Admins can delete records' }, { status: 403 });
        }

        // Check if exists
        const check = await query('SELECT id FROM repairs WHERE id = $1', [params.id]);
        if (check.rowCount === 0) {
            return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
        }

        // Delete related invoice if exists (optional, or cascade? defaulting to cascade behavior usually DB side if set up, but let's be explicit)
        // Actually we don't have FK constraints explicitly set up with CASCADE in the schema tool calls earlier, usually just loose tables.
        // Let's delete from repairs.
        // Delete related invoice first
        await query('DELETE FROM invoices WHERE repair_id = $1', [params.id]);
        await query('DELETE FROM repairs WHERE id = $1', [params.id]);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Delete Repair Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
