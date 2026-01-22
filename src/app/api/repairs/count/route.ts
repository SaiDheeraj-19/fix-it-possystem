import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Try to get counts, return 0 if table doesn't exist
        let pending = 0;
        let repaired = 0;
        let delivered = 0;
        let total = 0;

        try {
            const result = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'NEW' OR status = 'PENDING') as pending,
          COUNT(*) FILTER (WHERE status = 'REPAIRED') as repaired,
          COUNT(*) FILTER (WHERE status = 'DELIVERED') as delivered,
          COUNT(*) FILTER (WHERE status NOT IN ('DELIVERED', 'CANCELLED')) as active,
          COUNT(*) as total
        FROM repairs
      `);

            if (result.rows[0]) {
                pending = parseInt(result.rows[0].pending) || 0;
                repaired = parseInt(result.rows[0].repaired) || 0;
                delivered = parseInt(result.rows[0].delivered) || 0;
                const active = parseInt(result.rows[0].active) || 0;
                total = parseInt(result.rows[0].total) || 0;

                return NextResponse.json({ pending, repaired, delivered, active, total });
            }
        } catch (err: any) {
            // Table doesn't exist yet, return zeros
            if (err.code !== '42P01') {
                throw err;
            }
        }

        return NextResponse.json({ pending, repaired, delivered, total });
    } catch (err: any) {
        return NextResponse.json({ pending: 0, repaired: 0, delivered: 0, total: 0 });
    }
}
