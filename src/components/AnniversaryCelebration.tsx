"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, PartyPopper } from "lucide-react";

// Load special font style & CSS for Cake
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

.font-script { font-family: 'Great Vibes', cursive; }
.font-serif-display { font-family: 'Playfair Display', serif; }

/* Enhanced Cake CSS */
.cake-container { position: relative; width: 150px; height: 120px; }
.cake-body {
  position: absolute; bottom: 0; width: 100%; height: 60%;
  background: #f0e4d0; border-radius: 10px 10px 0 0;
  box-shadow: inset 0 -15px #e0c8a0, 0 10px 20px rgba(0,0,0,0.2);
}
.cake-layer {
  position: absolute; top: 40%; width: 100%; height: 20%;
  background: #ff5577; z-index: 1;
}
.icing {
  position: absolute; top: -15px; width: 100%;
  display: flex; justify-content: space-between; z-index: 2;
}
.drip {
  width: 25px; height: 35px; background: #fff;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.cherry-cnt { position: absolute; top: -10px; left: 50%; transform: translate(-50%); z-index: 5; }
.cherry {
  width: 20px; height: 20px; background: #d00;
  border-radius: 50%; box-shadow: inset -3px -3px rgba(0,0,0,0.3);
}
.candles { position: absolute; top: -30px; width: 100%; display: flex; justify-content: space-evenly; }
.candle {
  position: relative; width: 10px; height: 40px;
  background: conic-gradient(#f00, #ff0, #00f, #0f0);
  border-radius: 4px;
}
.flame {
  position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
  width: 12px; height: 20px; background: orange;
  border-radius: 50% 50% 20% 20%;
  box-shadow: 0 0 10px #ff0, 0 0 20px #ff0;
  animation: flicker 0.5s infinite alternate;
}
@keyframes flicker {
  0% { transform: translateX(-50%) scale(1); opacity: 1; }
  100% { transform: translateX(-50%) scale(0.9); opacity: 0.8; }
}
`;

const useAnniversaryCheck = () => {
    const [isAnniversary, setIsAnniversary] = useState(false);
    useEffect(() => {
        const now = new Date();
        const targetDate = { date: 27, month: 0, year: 2026 };
        // Strict check: Only valid on 27th Jan 2026
        const isToday = now.getDate() === targetDate.date && now.getMonth() === targetDate.month && now.getFullYear() === targetDate.year;
        setIsAnniversary(isToday);
    }, []);
    return isAnniversary;
};

// ---------------------------------------------------------
// COMPONENT: The Cake
// ---------------------------------------------------------
function BirthdayCake() {
    return (
        <div className="cake-container mx-auto">
            <div className="candles">
                <div className="candle"><div className="flame" style={{ animationDelay: '0s' }}></div></div>
                <div className="candle"><div className="flame" style={{ animationDelay: '0.2s' }}></div></div>
                <div className="candle"><div className="flame" style={{ animationDelay: '0.1s' }}></div></div>
            </div>
            <div className="cherry-cnt"><div className="cherry"></div></div>
            <div className="cake-body">
                <div className="icing">
                    {[...Array(6)].map((_, i) => <div key={i} className="drip"></div>)}
                </div>
                <div className="cake-layer"></div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// Global State for Re-triggering
// ---------------------------------------------------------
// Note: In a real app we might use Context, but for this simple interaction
// we can lift state or use a simple event bus. Here, we'll export a custom event trigger.
export const triggerAnniversaryReplay = () => {
    window.dispatchEvent(new Event('replay-anniversary'));
};


// ---------------------------------------------------------
// COMPONENT: Main Orchestrator
// ---------------------------------------------------------
export function AnniversaryPopup() {
    const isAnniversary = useAnniversaryCheck();
    // Stages: 'idle' -> 'curtain' -> 'cake' -> 'three' -> 'techbro' -> 'popup' -> 'finished'
    const [stage, setStage] = useState<'idle' | 'curtain' | 'cake' | 'three' | 'techbro' | 'popup' | 'finished'>('idle');

    useEffect(() => {
        const hasShown = sessionStorage.getItem("anniversary_shown_v6");
        if (isAnniversary && !hasShown) {
            setStage('curtain');
        }
    }, [isAnniversary]);

    // Listen for Replay Event
    useEffect(() => {
        const handleReplay = () => {
            if (isAnniversary) setStage('curtain');
        };
        window.addEventListener('replay-anniversary', handleReplay);
        return () => window.removeEventListener('replay-anniversary', handleReplay);
    }, [isAnniversary]);

    // Sequence Controller
    useEffect(() => {
        if (stage === 'curtain') {
            setTimeout(() => setStage('cake'), 500);
        }
        else if (stage === 'cake') {
            setTimeout(() => setStage('three'), 3500);
        }
        else if (stage === 'three') {
            triggerConfetti();
            setTimeout(() => setStage('techbro'), 3000);
        }
        else if (stage === 'techbro') {
            setTimeout(() => setStage('popup'), 3000);
        }
        else if (stage === 'popup') {
            sessionStorage.setItem("anniversary_shown_v6", "true");
        }
    }, [stage]);

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#FFA500'] });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#FFA500'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    };

    if (stage === 'idle' || stage === 'finished') return null;

    return (
        <AnimatePresence mode="wait">
            <style>{styles}</style>

            {/* ---------------- STAGE: BLACK CURTAIN / BACKDROP ---------------- */}
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            >

                {/* ---------------- STAGE: FLOATING CAKE ---------------- */}
                {stage === 'cake' && (
                    <motion.div
                        key="cake-stage"
                        initial={{ y: 500, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1.5 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
                        className="relative z-10"
                    >
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse"></div>
                        <BirthdayCake />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center font-script text-white text-3xl mt-12 text-yellow-200"
                        >
                            Something sweet is happening...
                        </motion.p>
                    </motion.div>
                )}

                {/* ---------------- STAGE: THE BIG 3 ---------------- */}
                {stage === 'three' && (
                    <motion.div
                        key="three-stage"
                        initial={{ scale: 0, rotate: -45, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
                        className="relative z-20 text-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 blur-[80px] opacity-50 rounded-full"></div>
                        <h1 className="text-[200px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 drop-shadow-[0_0_50px_rgba(234,179,8,0.8)] font-serif-display">
                            3
                        </h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-white font-serif-display text-2xl tracking-[0.5em] uppercase"
                        >
                            Years
                        </motion.p>
                    </motion.div>
                )}

                {/* ---------------- STAGE: TECH BRO WISHES ---------------- */}
                {stage === 'techbro' && (
                    <motion.div
                        key="techbro-stage"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-20 text-center max-w-2xl px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="mb-6 mx-auto w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                        />

                        <h2 className="text-4xl md:text-5xl font-serif-display text-white mb-6 leading-tight">
                            "Success is the sum of small efforts repeated day in and day out."
                        </h2>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <p className="text-gray-400 font-script text-3xl">With Best Wishes,</p>
                            <p className="text-blue-400 font-bold text-xl tracking-widest uppercase border-b border-blue-500/30 pb-1">
                                Tech Bro
                            </p>
                        </motion.div>
                    </motion.div>
                )}

                {/* ---------------- STAGE: FINAL POPUP ---------------- */}
                {stage === 'popup' && (
                    <motion.div
                        key="popup-stage"
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="relative max-w-lg w-full p-8 mx-4 bg-gray-900 border border-yellow-500/30 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Background FX */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/30 rounded-full blur-[80px]"></div>
                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-yellow-600/30 rounded-full blur-[80px]"></div>
                        </div>

                        <button
                            onClick={() => setStage('finished')}
                            className="absolute top-4 right-4 z-20 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative z-10 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <span className="font-serif-display text-4xl text-white font-bold">3</span>
                            </motion.div>

                            <h2 className="text-5xl font-script text-white mb-2">Happy Anniversary</h2>
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6"></div>

                            <p className="text-gray-300 font-light leading-relaxed mb-8">
                                Celebrating 3 years of hard work, dedication, and excellence. Thank you for making FIX IT the best in the business!
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    // Fire Party Poppers!
                                    const count = 200;
                                    const defaults = { origin: { y: 0.7 } };
                                    function fire(particleRatio: number, opts: any) {
                                        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
                                    }
                                    fire(0.25, { spread: 26, startVelocity: 55 });
                                    fire(0.2, { spread: 60 });
                                    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                                    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
                                    fire(0.1, { spread: 120, startVelocity: 45 });

                                    setTimeout(() => setStage('finished'), 200);
                                }}
                                className="px-8 py-3 bg-white text-black font-semibold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center justify-center gap-2 mx-auto"
                            >
                                <Gift size={18} className="text-purple-600" />
                                <span>Let's Celebrate</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export function AnniversaryBanner() {
    const isAnniversary = useAnniversaryCheck();
    if (!isAnniversary) return null;

    return (
        <>
            <style>{styles}</style>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={triggerAnniversaryReplay}
                className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-black border border-yellow-500/20 shadow-lg cursor-pointer group"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                            <PartyPopper className="text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-500">3rd Anniversary Special</h3>
                            <p className="text-xs text-gray-500">Celebrating our Team's Success <span className="text-yellow-500/50 ml-2">(Click to Replay)</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2 text-2xl">
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🍰</motion.span>
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>🎊</motion.span>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
