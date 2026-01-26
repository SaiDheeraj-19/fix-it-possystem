import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // optional filtering
        const year = searchParams.get('year');

        let sql = 'SELECT * FROM expenditures ORDER BY date DESC';
        const params: any[] = [];

        if (month && year) {
            // Filter by month/year if needed, for simplicity we might just return all and filter client side 
            // or implement date range query.
            // Let's return recent 50 for now or implement proper filtering later if requested.
        }

        const result = await query(sql, params);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenditures:', error);
        return NextResponse.json({ error: 'Failed to fetch expenditures' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, amount, description, date } = body;

        if (!category || !amount) {
            return NextResponse.json({ error: 'Category and amount are required' }, { status: 400 });
        }

        const session = await getSession();
        // @ts-ignore
        const userId = session?.id || null;

        const sql = `
          INSERT INTO expenditures (category, amount, description, date, created_by)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        // For date, use provided date or default
        const validDate = date ? new Date(date) : new Date();

        const result = await query(sql, [category, amount, description, validDate, userId]);
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error adding expenditure FULL DETAILS:', error);

        return NextResponse.json({
            error: 'Failed to add expenditure',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = 'DELETE FROM expenditures WHERE id = $1 RETURNING *';
        const result = await query(sql, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Expenditure not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deleted: result.rows[0] });
    } catch (error: any) {
        console.error('Error deleting expenditure:', error);
        return NextResponse.json({ error: 'Failed to delete expenditure', details: error.message }, { status: 500 });
    }
}
