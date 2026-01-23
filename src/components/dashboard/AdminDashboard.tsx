"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Layers, Calendar, FileText, Settings, UserPlus, Filter, Plus, ShoppingCart, PieChart as PieChartIcon, Activity } from 'lucide-react';

import { LiveClock } from '@/components/dashboard/LiveClock';
import { AdminWelcomeScreen } from '@/components/dashboard/AdminWelcomeScreen';

interface DashboardData {
    revenue: number;
    todayRevenue: number;
    pendingBalance: number;
    activeRepairs: number;
    repairsThisMonth: number;
    trendData: { name: string; revenue: number }[];
    categoryData: { name: string; revenue: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [chartPeriod, setChartPeriod] = useState<'WEEK' | 'MONTH'>('WEEK');
    const [viewType, setViewType] = useState<'TREND' | 'CATEGORY'>('CATEGORY');

    useEffect(() => {
        const hasSeenWelcome = sessionStorage.getItem('hasSeenAdminWelcome');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
        }
    }, []);

    const handleWelcomeComplete = () => {
        sessionStorage.setItem('hasSeenAdminWelcome', 'true');
        setShowWelcome(false);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/dashboard/stats?period=${chartPeriod}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                setData(null);
            }
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [chartPeriod]);

    if (showWelcome) return <AdminWelcomeScreen onComplete={handleWelcomeComplete} />;

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-40 bg-gray-900 rounded-2xl"></div>
            <div className="h-40 bg-gray-900 rounded-2xl"></div>
            <div className="h-40 bg-gray-900 rounded-2xl"></div>
        </div>
    );

    if (!data) return <div className="text-white">Failed to load data</div>;

    const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
            </div>

            <LiveClock />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Today's Revenue */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-900/50 to-black border border-blue-900/30 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-32 h-32 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-blue-200 font-medium mb-1">Today's Revenue</p>
                        <h3 className="text-5xl font-bold text-white tracking-tight">{formatCurrency(data.todayRevenue)}</h3>
                        <div className="flex items-center gap-2 mt-4 text-blue-300/80 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' })}
                        </div>
                    </div>
                </div>

                {/* Pending Balance */}
                <div className="col-span-1 md:col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full">Alert</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Pending Collections</p>
                        <h3 className="text-2xl font-bold text-white">{formatCurrency(data.pendingBalance)}</h3>
                    </div>
                </div>

                {/* Active Repairs */}
                <div className="col-span-1 md:col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Layers className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{data.activeRepairs} Active</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Repair Queue</p>
                        <h3 className="text-2xl font-bold text-white">{data.activeRepairs} Devices</h3>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="col-span-1 md:col-span-3 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 min-h-[400px] flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200">Revenue Analytics</h3>
                            <p className="text-sm text-gray-500">Track earnings by time or category.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* View Type Toggle */}
                            <div className="flex bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewType('TREND')}
                                    className={`p-2 rounded-md transition-colors ${viewType === 'TREND' ? 'bg-black text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                    title="Trend View"
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewType('CATEGORY')}
                                    className={`p-2 rounded-md transition-colors ${viewType === 'CATEGORY' ? 'bg-black text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                    title="Category View"
                                >
                                    <PieChartIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Period Toggle */}
                            <div className="flex bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setChartPeriod('WEEK')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartPeriod === 'WEEK' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => setChartPeriod('MONTH')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartPeriod === 'MONTH' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {viewType === 'CATEGORY' ? (
                                <PieChart>
                                    <Pie
                                        data={data.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                    >
                                        {data.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number) => [`Rs. ${value.toLocaleString('en-IN')}`, 'Revenue']}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            ) : (
                                <AreaChart data={data.trendData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
                                    <YAxis stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ stroke: '#ffffff20' }}
                                        formatter={(value: number) => [`Rs. ${value.toLocaleString('en-IN')}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions & Monthly Stats */}
                <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex-1">
                        <div className="space-y-3">
                            <Link href="/repairs/new" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">New Repair Order</span>
                            </Link>

                            <Link href="/dashboard/sales" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">Quick Store Sale</span>
                            </Link>

                            <Link href="/dashboard/users" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">Manage Staff</span>
                            </Link>

                            <Link href="/invoices" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">Invoices</span>
                            </Link>

                            <Link href="/repairs" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:scale-110 transition-transform">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">Manage All</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Repairs This Month</h3>
                        <p className="text-3xl font-bold text-white">{data.repairsThisMonth}</p>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
