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
            paymentMode,
            saleDate // Optional custom date
        } = body;

        if (!itemName || !quantity || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const totalPrice = quantity * price;

        const result = await query(
            `INSERT INTO sales 
            (item_name, category, quantity, price_per_unit, total_price, payment_mode, created_by, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [
                itemName,
                category || 'Accessories',
                quantity,
                price,
                totalPrice,
                paymentMode || 'CASH',
                session.id,
                saleDate ? new Date(saleDate) : new Date() // Use provided date or current time
            ]
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
        return NextResponse.json({ error: err.message }, { status: 500 });
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

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await query('DELETE FROM sales WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') { // Only admins can edit sales for now is a safe default
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const {
            id,
            itemName,
            category,
            quantity,
            price,
            paymentMode
        } = body;

        if (!id || !itemName || !quantity || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const totalPrice = quantity * price;

        await query(
            `UPDATE sales 
            SET item_name = $1, category = $2, quantity = $3, price_per_unit = $4, total_price = $5, payment_mode = $6
            WHERE id = $7`,
            [itemName, category, quantity, price, totalPrice, paymentMode || 'CASH', id]
        );

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Update Sale Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
