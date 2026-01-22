"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeScreenProps {
    name?: string;
    role?: string;
    onComplete: () => void;
}

export const AdminWelcomeScreen: React.FC<WelcomeScreenProps> = ({
    name = "Dinesh",
    role = "CEO, FIX IT",
    onComplete
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800);
        }, 1500); // Shorter duration for smoother UX

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-10 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

                        <div className="relative text-center space-y-2">
                            <h1 className="text-5xl font-bold tracking-tighter text-white">
                                FIX <span className="text-blue-600">IT</span>
                            </h1>
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4" />
                            <h2 className="text-2xl font-medium text-gray-200">
                                Welcome, {name}
                            </h2>
                            <p className="text-sm text-blue-400 font-medium tracking-widest uppercase">
                                {role}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
