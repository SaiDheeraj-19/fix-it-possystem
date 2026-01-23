"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Smartphone, Search, Plus, Filter,
    CheckCircle2, Clock, Truck, XCircle,
    ChevronRight, ArrowUpRight, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Repair {
    id: string;
    customer_name: string;
    customer_phone: string;
    device_brand: string;
    device_model: string;
    estimated_cost: string;
    advance: string;
    status: string;
    created_at: string;
}

const TABS = [
    { id: 'ALL', label: 'All Orders', icon: LayoutGrid },
    { id: 'NEW', label: 'New', icon: Plus },
    { id: 'PENDING', label: 'Pending', icon: Clock },
    { id: 'REPAIRED', label: 'Completed', icon: CheckCircle2 },
    { id: 'DELIVERED', label: 'Delivered', icon: Truck },
];

function RepairsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'ALL');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    // Debounce search
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'ALL') params.append('status', activeTab);
            if (searchQuery) params.append('search', searchQuery);
            params.append('limit', '100'); // Higher limit for manage page

            const res = await fetch(`/api/repairs?${params.toString()}`);
            const data = await res.json();

            if (data.repairs) {
                setRepairs(data.repairs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        // Sync URL with state (optional, helps with page refresh)
        const params = new URLSearchParams();
        if (activeTab !== 'ALL') params.set('status', activeTab);
        if (searchQuery) params.set('search', searchQuery);
        router.replace(`/repairs?${params.toString()}`, { scroll: false });

        fetchData();
    }, [activeTab]);

    // Handle Search with debounce
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchData();
        }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchQuery]);


    // --- UI Helpers ---
    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'NEW': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
            case 'PENDING': return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
            case 'REPAIRED': return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
            case 'DELIVERED': return { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
            default: return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            Manage Repairs
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">
                            Track, update, and manage all service orders in one place.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-medium hover:bg-gray-800 transition-all">
                            Back
                        </Link>
                        <Link href="/repairs/new" className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            <Plus className="w-5 h-5" />
                            <span>New Repair</span>
                        </Link>
                    </div>
                </div>

                {/* Filters & Search Area */}
                <div className="sticky top-4 z-20 bg-black/80 backdrop-blur-xl border border-white/5 rounded-3xl p-2 mb-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                        {/* Tabs */}
                        <div className="flex items-center p-1 gap-1 overflow-x-auto w-full lg:w-auto no-scrollbar">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-gray-800 rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2 text-sm font-semibold">
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full lg:w-96 p-1">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search client, mobile, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-24 bg-gray-900/40 rounded-2xl animate-pulse border border-gray-800/50" />
                            ))}
                        </div>
                    ) : repairs.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-4"
                        >
                            {repairs.map((repair) => {
                                const style = getStatusStyle(repair.status);
                                const balance = parseFloat(repair.estimated_cost) - parseFloat(repair.advance);

                                return (
                                    <Link key={repair.id} href={`/repairs/${repair.id}`}>
                                        <motion.div
                                            layout
                                            initial={{ scale: 0.98, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                            className="group relative bg-gray-900/30 border border-gray-800 rounded-2xl p-5 transition-all hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-900/10"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                                {/* Left Info */}
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-2xl ${style.bg} border ${style.border} shrink-0`}>
                                                        <Smartphone className={`w-6 h-6 ${style.color}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {repair.device_brand} {repair.device_model}
                                                            </h3>
                                                            {balance > 0 && (
                                                                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                    Due
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-400">
                                                            <span className="font-medium text-gray-300">{repair.customer_name}</span>
                                                            <span className="hidden sm:inline w-1 h-1 bg-gray-700 rounded-full" />
                                                            <span className="font-mono">{repair.customer_phone}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2 font-mono uppercase tracking-widest">
                                                            ORD-{repair.id.slice(0, 6)} • {new Date(repair.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right Status & Balance */}
                                                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-0 border-gray-800 pt-4 md:pt-0">

                                                    <div className="text-right">
                                                        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Estimated Cost</div>
                                                        <div className="text-xl font-bold text-white">
                                                            ₹{parseFloat(repair.estimated_cost).toLocaleString('en-IN')}
                                                        </div>
                                                    </div>

                                                    <div className={`px-4 py-2 rounded-xl border ${style.border} ${style.bg} ${style.color} text-xs font-bold uppercase tracking-wider flex items-center gap-2`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        {repair.status}
                                                    </div>

                                                    <div className="p-2 rounded-full bg-gray-800 text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </div>
                                                </div>

                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                                <Filter className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No repairs found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We couldn't find any orders matching your filters. Try creating a new one or adjusting your search.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function RepairsManagePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <RepairsContent />
        </Suspense>
    );
}
