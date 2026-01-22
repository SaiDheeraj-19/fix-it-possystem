import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const {
            itemName,
            category,
            quantity,
            price,
            customerName,
            customerPhone
        } = body;

        if (!itemName || !quantity || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure sales table exists
        await query(`
            CREATE TABLE IF NOT EXISTS sales (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                item_name TEXT NOT NULL,
                category TEXT,
                quantity INTEGER DEFAULT 1,
                price_per_unit NUMERIC DEFAULT 0,
                total_price NUMERIC DEFAULT 0,
                customer_name TEXT,
                customer_phone TEXT,
                created_by UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Kolkata', now())
            )
        `);

        const totalPrice = quantity * price;

        const result = await query(
            `INSERT INTO sales 
            (item_name, category, quantity, price_per_unit, total_price, customer_name, customer_phone, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [itemName, category || 'Accessories', quantity, price, totalPrice, customerName || null, customerPhone || null, session.id]
        );

        return NextResponse.json({
            success: true,
            saleId: result.rows[0].id
        });

    } catch (err: any) {
        console.error('Create Sale Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '50';

        const result = await query(`
            SELECT * FROM sales 
            ORDER BY created_at DESC 
            LIMIT $1
        `, [limit]);

        return NextResponse.json({ sales: result.rows });
    } catch (err: any) {
        if (err.code === '42P01') {
            return NextResponse.json({ sales: [] });
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
