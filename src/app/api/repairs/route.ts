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

        // Ensure repairs table exists with all columns
        await query(`
      CREATE TABLE IF NOT EXISTS repairs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        device_brand TEXT NOT NULL,
        device_model TEXT NOT NULL,
        problem TEXT NOT NULL,
        imei TEXT,
        estimated_cost NUMERIC NOT NULL DEFAULT 0,
        advance NUMERIC NOT NULL DEFAULT 0,
        warranty TEXT,
        status TEXT DEFAULT 'NEW',
        pin_encrypted TEXT,
        pin_iv TEXT,
        pattern_encrypted TEXT,
        pattern_iv TEXT,
        password_encrypted TEXT,
        password_iv TEXT,
        images JSONB,
        created_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        balance_collected_at TIMESTAMP
      )
    `);

        // Add columns if they don't exist (migrations)
        try {
            await query('ALTER TABLE repairs ADD COLUMN IF NOT EXISTS warranty TEXT');
            await query('ALTER TABLE repairs ALTER COLUMN images TYPE JSONB USING images::JSONB');
        } catch (e) {
            // Ignore
        }

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
        const repairResult = await query(
            `INSERT INTO repairs 
       (customer_name, customer_phone, device_brand, device_model, problem, imei, 
        estimated_cost, advance, warranty,
        pin_encrypted, pin_iv, pattern_encrypted, pattern_iv, password_encrypted, password_iv,
        images, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING id`,
            [
                customerName, customerMobile, deviceBrand, deviceModel, problem, imei || null,
                estimatedCost || 0, advance || 0, warrantyDays || '', // map form's warrantyDays to warranty column
                pinEncrypted, pinIv, patternEncrypted, patternIv, passwordEncrypted, passwordIv,
                JSON.stringify(images || []), session.id
            ]
        );

        return NextResponse.json({ success: true, repairId: repairResult.rows[0].id });

    } catch (e: any) {
        console.error('Create Repair Error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Ensure table exists
        await query(`
      CREATE TABLE IF NOT EXISTS repairs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        device_brand TEXT NOT NULL,
        device_model TEXT NOT NULL,
        problem TEXT NOT NULL,
        imei TEXT,
        estimated_cost NUMERIC NOT NULL DEFAULT 0,
        advance NUMERIC NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'NEW',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

        const result = await query('SELECT * FROM repairs ORDER BY created_at DESC LIMIT 50');
        return NextResponse.json({ repairs: result.rows });
    } catch (e: any) {
        console.error('Get Repairs Error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
