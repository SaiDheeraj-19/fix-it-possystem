import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const {
            repairId,
            customerName,
            customerMobile,
            deviceBrand,
            deviceModel,
            problem,
            estimatedCost,
            advance,
            warrantyDays
        } = body;

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
        const balance = (estimatedCost || 0) - (advance || 0);

        // Insert invoice
        const result = await query(
            `INSERT INTO invoices 
       (repair_id, invoice_number, customer_name, customer_mobile, device_brand, device_model, problem, estimated_cost, advance, balance, warranty_days, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, invoice_number`,
            [repairId || null, invoiceNumber, customerName, customerMobile, deviceBrand, deviceModel, problem, estimatedCost || 0, advance || 0, balance, warrantyDays || 0, session.id]
        );

        return NextResponse.json({
            success: true,
            invoiceId: result.rows[0].id,
            invoiceNumber: result.rows[0].invoice_number
        });

    } catch (err: any) {
        console.error('Create Invoice Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const result = await query(`
            SELECT * FROM invoices 
            ORDER BY created_at DESC 
            LIMIT 100
        `);
        return NextResponse.json({ invoices: result.rows });

    } catch (err: any) {
        console.error('Get Invoices Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
