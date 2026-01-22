"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Truck, ShoppingCart, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

import { LiveClock } from '@/components/dashboard/LiveClock';

export function StaffDashboard() {
    const [activeCount, setActiveCount] = useState(0);

    useEffect(() => {
        // Fetch real active count (everything not delivered/cancelled)
        fetch('/api/repairs/count')
            .then(res => res.json())
            .then(data => setActiveCount(data.active || 0))
            .catch(() => setActiveCount(0));
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
                            if (val) window.location.href = `/repairs?search=${val}`;
                        }
                    }}
                />
            </div>

            {/* Actions Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
            </motion.div>

            {/* Recent Repairs Section */}
            <div className="mt-12">
                <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>
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
        </div>
    );
}
