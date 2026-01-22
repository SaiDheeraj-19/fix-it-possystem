import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Smartphone } from 'lucide-react';

async function getRepairs() {
    try {
        // Simple query without JOIN - repairs table stores customer info directly
        const res = await query(`
      SELECT * FROM repairs 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
        return res.rows;
    } catch (err: any) {
        // Table doesn't exist, create it
        if (err.code === '42P01') {
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
          pin_encrypted TEXT,
          pin_iv TEXT,
          pattern_encrypted TEXT,
          pattern_iv TEXT,
          images JSONB,
          created_by UUID,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
            return [];
        }
        throw err;
    }
}

export default async function RepairsListPage() {
    const session = await getSession();
    if (!session) redirect('/');

    const repairs = await getRepairs();

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'NEW': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
            case 'PENDING': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'REPAIRED': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'DELIVERED': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
            default: return 'text-red-400';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Repair Orders</h1>
                    <div className="flex gap-4">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
                            ← Back to Dashboard
                        </Link>
                        <Link href="/repairs/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold">
                            + New Repair
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4">
                    {repairs.map((repair: any) => (
                        <div key={repair.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center hover:border-gray-600 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <Smartphone className="text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{repair.device_brand} {repair.device_model}</h3>
                                    <p className="text-gray-400 text-sm">{repair.customer_name} • {repair.customer_phone}</p>
                                    <p className="text-xs text-gray-500 mt-1">Order #{repair.id?.slice(0, 8)} • {new Date(repair.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Balance</p>
                                    <p className="font-mono font-bold text-red-400">₹{(repair.estimated_cost - repair.advance).toLocaleString()}</p>
                                </div>

                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(repair.status)}`}>
                                    {repair.status}
                                </span>

                                <Link href={`/repairs/${repair.id}`} className="text-blue-400 hover:text-white underline text-sm">
                                    View →
                                </Link>
                            </div>
                        </div>
                    ))}

                    {repairs.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            No repairs found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
