import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';

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

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const {
            customerName,
            customerMobile,
            deviceBrand,
            deviceModel,
            imei,
            problem,
            estimatedCost,
            advance,
            warrantyDays,
            security,
            images
        } = body;

        // Basic validation
        if (!customerName || !customerMobile || !deviceBrand || !deviceModel || !problem) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Prepare query fields
        let updateFields = [
            `customer_name = $1`,
            `customer_phone = $2`,
            `device_brand = $3`,
            `device_model = $4`,
            `imei = $5`,
            `problem = $6`,
            `estimated_cost = $7`,
            `advance = $8`,
            `warranty = $9` // Column name is 'warranty' in DB based on creation script, but form says warrantyDays. Check usage.
        ];

        // Check warranty column name in previous read of NewRepairForm: 'warranty' column used in getRepair.

        let values = [
            customerName,
            customerMobile,
            deviceBrand,
            deviceModel,
            imei || null,
            problem,
            estimatedCost || 0,
            advance || 0,
            warrantyDays || null,
        ];

        let paramCount = 9;

        // Handle Security Updates if provided
        // We need to re-encrypt if security is updated.
        // For now, simpler to just update non-security fields or handle security if passed.
        // If security is passed, we need 'encrypt' helper.

        // Handle Security Updates if provided
        if (security) {
            updateFields.push(`pin_encrypted = $${++paramCount}`);
            updateFields.push(`pin_iv = $${++paramCount}`);

            updateFields.push(`pattern_encrypted = $${++paramCount}`);
            updateFields.push(`pattern_iv = $${++paramCount}`);

            updateFields.push(`password_encrypted = $${++paramCount}`);
            updateFields.push(`password_iv = $${++paramCount}`);

            let pinEnc = null, pinIv = null;
            let patEnc = null, patIv = null;
            let passEnc = null, passIv = null;

            if (security.mode !== 'NONE' && security.value) {
                const encrypted = encrypt(security.value);
                if (security.mode === 'PIN') {
                    pinEnc = encrypted.content;
                    pinIv = encrypted.iv;
                } else if (security.mode === 'PATTERN') {
                    patEnc = encrypted.content;
                    patIv = encrypted.iv;
                } else if (security.mode === 'PASSWORD') {
                    passEnc = encrypted.content;
                    passIv = encrypted.iv;
                }
            }

            values.push(pinEnc, pinIv, patEnc, patIv, passEnc, passIv);
        }

        // Handle Images
        if (images) {
            paramCount++;
            updateFields.push(`images = $${paramCount}`);
            values.push(JSON.stringify(images)); // Array of base64 strings
        }

        // Construct Query
        const queryText = `
            UPDATE repairs 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount + 1}
        `;
        values.push(params.id);

        await query(queryText, values);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Update Repair Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
