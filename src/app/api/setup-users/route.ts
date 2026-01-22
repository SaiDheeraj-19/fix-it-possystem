import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const salt = bcrypt.genSaltSync(10);

        // 1. Setup Admin (Dinesh)
        const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeDirectlyInDB!123';
        const adminHash = bcrypt.hashSync(adminPassword, salt);

        // Try to find existing admin to update
        const adminRes = await query("SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1");

        if (adminRes && (adminRes.rowCount ?? 0) > 0) {
            // Update existing admin
            await query(
                "UPDATE users SET name = $1, password_hash = $2 WHERE id = $3",
                ['dinesh', adminHash, adminRes.rows[0].id]
            );
        } else {
            // Create new admin
            await query(
                "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
                ['dinesh', process.env.ADMIN_EMAIL || 'admin@fixit.com', adminHash, 'ADMIN']
            );
        }

        // 2. Setup Staff
        const staffPassword = process.env.STAFF_PASSWORD || 'StaffOnlyPass!789';
        const staffHash = bcrypt.hashSync(staffPassword, salt);

        // Try to find existing staff
        const staffRes = await query("SELECT * FROM users WHERE role = 'STAFF' LIMIT 1");

        if (staffRes && (staffRes.rowCount ?? 0) > 0) {
            // Update existing staff
            await query(
                "UPDATE users SET name = 'staff', password_hash = $1 WHERE id = $2",
                [staffHash, staffRes.rows[0].id]
            );
        } else {
            // Create new staff
            await query(
                "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
                ['staff', process.env.STAFF_EMAIL || 'staff@fixit.com', staffHash, 'STAFF']
            );
        }

        return NextResponse.json({
            success: true,
            message: "Users updated successfully."
        });

    } catch (e: any) {
        console.error("Setup Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
