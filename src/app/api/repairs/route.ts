import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const {
            customerName, customerMobile,
            deviceBrand, deviceModel, problem, imei,
            estimatedCost, advance, warrantyDays,
            security, images
        } = body;

        // Encrypt Security Data if provided
        let pinEncrypted = null, pinIv = null;
        let patternEncrypted = null, patternIv = null;
        let passwordEncrypted = null, passwordIv = null;

        if (security && security.value) {
            const enc = encrypt(security.value);
            if (security.mode === 'PIN') {
                pinEncrypted = enc.content;
                pinIv = enc.iv;
            } else if (security.mode === 'PASSWORD') {
                passwordEncrypted = enc.content;
                passwordIv = enc.iv;
            } else {
                patternEncrypted = enc.content;
                patternIv = enc.iv;
            }
        }

        // Insert Repair
        let repairId;
        try {
            const repairResult = await query(
                `INSERT INTO repairs 
           (id, customer_name, customer_phone, device_brand, device_model, problem, imei, 
            estimated_cost, advance, warranty,
            pin_encrypted, pin_iv, pattern_encrypted, pattern_iv, password_encrypted, password_iv,
            images, created_by)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING id`,
                [
                    customerName, customerMobile, deviceBrand, deviceModel, problem, imei || null,
                    estimatedCost || 0, advance || 0, warrantyDays || '',
                    pinEncrypted, pinIv, patternEncrypted, patternIv, passwordEncrypted, passwordIv,
                    JSON.stringify(images || []), session.id
                ]
            );
            repairId = repairResult.rows[0].id;
        } catch (dbErr: any) {
            console.error('Database Insert Error (Repairs):', dbErr);
            throw new Error(`Database Error: ${dbErr.message}`);
        }

        return NextResponse.json({ success: true, repairId: repairId });

    } catch (e: any) {
        console.error('Create Repair Error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let queryText = `
            SELECT 
                id, 
                customer_name, 
                customer_phone, 
                device_brand, 
                device_model, 
                estimated_cost, 
                advance, 
                status, 
                created_at 
            FROM repairs
            WHERE 1=1
        `;
        const queryParams: any[] = [];

        if (status && status !== 'ALL') {
            queryParams.push(status);
            queryText += ` AND status = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (
                customer_name ILIKE $${queryParams.length} OR 
                customer_phone ILIKE $${queryParams.length} OR 
                device_model ILIKE $${queryParams.length} OR
                id::text ILIKE $${queryParams.length}
            )`;
        }

        queryText += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1}`;
        queryParams.push(limit);

        const result = await query(queryText, queryParams);

        return NextResponse.json({ repairs: result.rows });
    } catch (e: any) {
        console.error('Get Repairs Error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
