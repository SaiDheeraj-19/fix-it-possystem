"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Truck, ShoppingCart, Smartphone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { LiveClock } from '@/components/dashboard/LiveClock';

export function StaffDashboard() {
    const router = useRouter();
    const [activeCount, setActiveCount] = useState(0);
    const [repairs, setRepairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real active count (everything not delivered/cancelled)
        fetch('/api/repairs/count')
            .then(res => res.json())
            .then(data => setActiveCount(data.active || 0))
            .catch(() => setActiveCount(0));

        // Fetch recent repairs
        fetch('/api/repairs?limit=5')
            .then(res => res.json())
            .then(data => {
                setRepairs(data.repairs || []);
                setLoading(false);
            })
            .catch(() => {
                setRepairs([]);
                setLoading(false);
            });
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

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
        <div className="space-y-8">
            <LiveClock />

            {/* Search Bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by Customer Name, Mobile or Order ID..."
                    className="bg-transparent text-white w-full outline-none placeholder:text-gray-500"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val) router.push(`/repairs?search=${val}`);
                        }
                    }}
                />
            </div>

            {/* Actions Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <motion.div variants={item}>
                    <Link href="/repairs/new" className="block group">
                        <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 relative overflow-hidden transition-transform hover:scale-[1.02]">
                            <Plus className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2 group-hover:scale-150 transition-transform duration-500" />
                            <Smartphone className="w-8 h-8 text-white mb-4" />
                            <h3 className="text-xl font-bold text-white">New Repair</h3>
                            <p className="text-blue-100 text-sm">Create job card & capture pattern</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div variants={item}>
                    <Link href="/repairs" className="block group">
                        <div className="h-40 bg-gray-600 bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-2xl p-6 relative overflow-hidden hover:border-blue-500 transition-colors">
                            <Search className="w-12 h-12 text-white/10 absolute -right-2 -bottom-2" />
                            <div className="flex justify-between items-start">
                                <Truck className="w-8 h-8 text-yellow-500 mb-4" />
                                {activeCount > 0 && (
                                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                        {activeCount} Active
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white">Active Repairs</h3>
                            <p className="text-gray-400 text-sm">Update status & track delivery</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div variants={item}>
                    <Link href="/dashboard/sales" className="block group">
                        <div className="h-40 bg-gray-600 bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-2xl p-6 relative overflow-hidden hover:border-green-500 transition-colors">
                            <ShoppingCart className="w-12 h-12 text-white/10 absolute -right-2 -bottom-2" />
                            <ShoppingCart className="w-8 h-8 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-white">Store Sales</h3>
                            <p className="text-gray-400 text-sm">Sell accessories & track revenue</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div variants={item}>
                    <Link href="/invoices" className="block group">
                        <div className="h-40 bg-gray-600 bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-2xl p-6 relative overflow-hidden hover:border-purple-500 transition-colors">
                            <FileText className="w-12 h-12 text-white/10 absolute -right-2 -bottom-2" />
                            <FileText className="w-8 h-8 text-purple-500 mb-4" />
                            <h3 className="text-xl font-bold text-white">Invoices</h3>
                            <p className="text-gray-400 text-sm">View and print past invoices</p>
                        </div>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Filters</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/repairs?status=NEW" className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                        <div className="text-2xl font-bold text-blue-400">New</div>
                        <div className="text-sm text-gray-400">Pending Intake</div>
                    </Link>
                    <Link href="/repairs?status=PENDING" className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-yellow-500 transition-colors">
                        <div className="text-2xl font-bold text-yellow-400">Pending</div>
                        <div className="text-sm text-gray-400">In Progress</div>
                    </Link>
                    <Link href="/repairs?status=REPAIRED" className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
                        <div className="text-2xl font-bold text-green-400">Repaired</div>
                        <div className="text-sm text-gray-400">Ready for Pickup</div>
                    </Link>
                    <Link href="/repairs?status=DELIVERED" className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-gray-500 transition-colors">
                        <div className="text-2xl font-bold text-gray-400">Delivered</div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </Link>
                </div>
            </div>

            {/* Recent Repairs Table/List */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-300">Recent Repairs</h2>
                    <Link href="/repairs" className="text-blue-500 text-sm hover:underline">View All</Link>
                </div>

                <div className="grid gap-3">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-20 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
                        ))
                    ) : repairs.length > 0 ? (
                        repairs.map((repair) => (
                            <Link key={repair.id} href={`/repairs/${repair.id}`} className="block group">
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-blue-500/50 transition-all">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-800 rounded-lg shrink-0">
                                                <Smartphone className="text-blue-400 w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                                    {repair.device_brand} {repair.device_model}
                                                </h3>
                                                <p className="text-xs text-gray-400">
                                                    {repair.customer_name} • {repair.customer_phone}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:flex flex-col items-end">
                                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Balance</span>
                                                <span className={`text-sm font-bold ${parseFloat(repair.estimated_cost) - parseFloat(repair.advance) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    ₹{(parseFloat(repair.estimated_cost) - parseFloat(repair.advance)).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(repair.status)}`}>
                                                {repair.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl">
                            <p className="text-gray-500 text-sm">No recent repairs found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
