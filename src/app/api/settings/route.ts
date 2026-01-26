import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const res = await query("SELECT value FROM system_settings WHERE key = 'maintenance_mode'");
        const isMaintenance = res.rows[0]?.value || false;
        return NextResponse.json({ maintenanceMode: isMaintenance });
    } catch (error) {
        console.error('Error fetching settings:', error);
        // Default to false if DB fails to avoid locking out
        return NextResponse.json({ maintenanceMode: false });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'TECH_BRO') {
            return NextResponse.json({ error: 'Unauthorized: Tech Bro Access Required' }, { status: 401 });
        }

        const { enabled } = await request.json();

        await query(
            "INSERT INTO system_settings (key, value) VALUES ('maintenance_mode', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = $1::jsonb",
            [JSON.stringify(enabled)]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
