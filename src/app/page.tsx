"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Smartphone, ShieldCheck, Zap, Server, Activity, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Live time for "Systems Online" effect
    const [time, setTime] = useState('');
    useEffect(() => {
        const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.target as HTMLFormElement;
        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                // Success Animation wait
                await new Promise(r => setTimeout(r, 800));
                router.push('/dashboard');
            } else {
                const data = await res.json();
                setError(data.error || 'Access Denied');
                setLoading(false);
            }
        } catch (err) {
            setError('System connection failure');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black overflow-hidden font-sans text-gray-100">
            {/* LEFT SIDE: Visuals & Info */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gray-950 border-r border-gray-900 overflow-hidden">

                {/* Background Grid Animation */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                {/* Ambient Blurs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">FIX IT <span className="text-gray-500 font-normal">POS System</span></h1>
                    </motion.div>

                    <div className="space-y-6 max-w-lg">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
                        >
                            Professional Repair Management
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-gray-400 leading-relaxed"
                        >
                            Secure, efficient, and reliable tracking for all your device service needs. Engineered for speed and precision.
                        </motion.p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto">
                    {[
                        { icon: ShieldCheck, label: "Secure Database", sub: "AES-256 Encryption" },
                        { icon: Zap, label: "Fast Processing", sub: "Real-time Updates" },
                        { icon: Activity, label: "Live Analytics", sub: "Revenue Tracking" },
                        { icon: Server, label: "Cloud Sync", sub: "99.9% Uptime" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <item.icon className="w-6 h-6 text-blue-400 mb-3" />
                            <h3 className="font-semibold text-white">{item.label}</h3>
                            <p className="text-xs text-gray-500">{item.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="relative z-10 mt-8 pt-8 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
                    <span>v2.4.0 (Stable)</span>
                    <span className="font-mono">{time} UTC+05:30</span>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative">
                {/* Mobile Background only */}
                <div className="lg:hidden absolute inset-0 bg-gray-950 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                <div className="w-full max-w-sm relative z-10 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 text-center"
                    >
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">FIX IT POS</h1>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Authenticate to access the control panel.</p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">IDENTITY</label>
                            <div className="relative group">
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-4 text-white placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg font-medium group-hover:border-gray-700"
                                    placeholder="Username"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">CREDENTIALS</label>
                            <div className="relative group">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-4 text-white placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg font-medium pr-12 group-hover:border-gray-700"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-lg flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 text-lg font-bold rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Secure Login</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 text-center"
                    >
                        <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Technical Support</p>
                        <p className="text-gray-200 font-medium">+91 91829 19360</p>
                        <p className="text-gray-500 text-xs mt-1">Shop No. 6, Kalluru</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
