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
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Repair Orders</h1>
                        <p className="text-gray-500 mt-1">Manage all device repairs and service jobs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-xl transition-colors">
                            Back
                        </Link>
                        <Link href="/repairs/new" className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all">
                            + New Repair
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4">
                    {repairs.map((repair: any) => (
                        <Link key={repair.id} href={`/repairs/${repair.id}`} className="block group">
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-blue-500/50 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-800 rounded-xl shrink-0">
                                            <Smartphone className="text-blue-400 w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
                                                {repair.device_brand} {repair.device_model}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400 mt-0.5">
                                                <span className="font-medium text-gray-300">{repair.customer_name}</span>
                                                <span className="hidden md:inline text-gray-600">•</span>
                                                <span>{repair.customer_phone}</span>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-gray-600 font-mono mt-1 uppercase tracking-wider">
                                                Order #{repair.id?.slice(0, 8)} • {new Date(repair.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800">
                                        <div className="flex flex-col md:items-end">
                                            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Balance</span>
                                            <span className={`text-xl font-black ${parseFloat(repair.estimated_cost) - parseFloat(repair.advance) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                ₹{(parseFloat(repair.estimated_cost) - parseFloat(repair.advance)).toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(repair.status)}`}>
                                                {repair.status}
                                            </span>
                                            <div className="p-2 text-gray-600 group-hover:text-white transition-colors">
                                                →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {repairs.length === 0 && (
                        <div className="text-center py-24 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
                            <Smartphone className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-500">No repairs found.</p>
                            <Link href="/repairs/new" className="text-blue-500 font-medium hover:underline mt-2 inline-block">Create your first repair order</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
