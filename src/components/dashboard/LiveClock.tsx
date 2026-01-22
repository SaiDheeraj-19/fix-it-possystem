"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const LiveClock = () => {
    const [date, setDate] = useState<Date | null>(null);

    useEffect(() => {
        setDate(new Date());
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!date) return null; // Avoid hydration mismatch

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row items-center justify-between bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl w-full"
        >
            <div className="flex flex-col">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight tabular-nums">
                    {time}
                </span>
                <span className="text-sm md:text-base text-blue-400 font-medium tracking-widest uppercase mt-1">
                    System Time : IST
                </span>
            </div>

            <div className="h-px w-full md:w-px md:h-12 bg-gray-700 my-4 md:my-0 md:mx-6"></div>

            <div className="flex flex-col items-center md:items-end">
                <span className="text-xl md:text-2xl font-bold text-gray-200">
                    {dayName}
                </span>
                <span className="text-sm md:text-base text-gray-500 font-medium">
                    {dayDate}
                </span>
            </div>
        </motion.div>
    );
};
