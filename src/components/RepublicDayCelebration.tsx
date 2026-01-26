"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Plane, Star } from "lucide-react";

// ----------------------------------------------------------------------
// CSS
// ----------------------------------------------------------------------
const styles = `
.cinematic-text {
  background: linear-gradient(to bottom, #fff 20%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
}
.spotlight {
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.floating { animation: float 6s ease-in-out infinite; }

/* Real Flag Waving Effect using SVG Filters would be best, but CSS approximation: */
@keyframes wave-flag {
  0% { transform: perspective(600px) rotateY(0deg) skewY(0deg); }
  25% { transform: perspective(600px) rotateY(5deg) skewY(2deg); }
  50% { transform: perspective(600px) rotateY(0deg) skewY(0deg); }
  75% { transform: perspective(600px) rotateY(-5deg) skewY(-2deg); }
  100% { transform: perspective(600px) rotateY(0deg) skewY(0deg); }
}

.flag-wave-container {
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transform-style: preserve-3d;
  animation: wave-flag 5s ease-in-out infinite;
}

/* Light glimmer moving across to simulate cloth ripple */
.flag-glimmer {
  position: absolute;
  top: 0; left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-20deg);
  animation: glimmer 3s infinite linear;
}
@keyframes glimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}
`;

const useRepublicDayCheck = () => {
    const [isRepublicDay, setIsRepublicDay] = useState(false);
    useEffect(() => {
        const now = new Date();
        const isToday = now.getDate() === 26 && now.getMonth() === 0;
        setIsRepublicDay(isToday);
    }, []);
    return isRepublicDay;
};

export const triggerRepublicDayReplay = () => {
    window.dispatchEvent(new Event('replay-cinematic'));
};

// ----------------------------------------------------------------------
// ANIMATION COMPONENTS
// ----------------------------------------------------------------------

function CinemaBars() {
    return (
        <>
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: "10vh" }}
                exit={{ height: 0 }}
                className="fixed top-0 left-0 right-0 bg-black z-[10000] pointer-events-none"
            />
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: "10vh" }}
                exit={{ height: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-black z-[10000] pointer-events-none"
            />
        </>
    );
}

function CinematicDust() {
    const parts = [...Array(40)].map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10
    }));

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {parts.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0], y: [0, -50] }}
                    transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
                    className="absolute rounded-full bg-[#FF9933]"
                    style={{
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.id % 2 === 0 ? '#FFD700' : '#FFF'
                    }}
                />
            ))}
        </div>
    );
}

function TiltCard({ children }: { children: React.ReactNode }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [4, -4]);
    const rotateY = useTransform(x, [-100, 100], [-4, 4]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - (rect.left + rect.width / 2));
        y.set(event.clientY - (rect.top + rect.height / 2));
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, perspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="w-full max-w-5xl"
        >
            {children}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// MAIN ORCHESTRA
// ----------------------------------------------------------------------

export function RepublicDayPopup() {
    const isRepublicDay = useRepublicDayCheck();
    // Stages: 'idle' -> 'black' -> 'text1' -> 'text2' -> 'main' -> 'exit'
    // JS removed 'jets' from stage
    const [stage, setStage] = useState<'idle' | 'black' | 'text1' | 'text2' | 'main' | 'exit'>('idle');

    // Start Intro Sequence
    useEffect(() => {
        const hasShown = sessionStorage.getItem("cinematic_rd_2026_v4");
        if (isRepublicDay && !hasShown) setStage('black');
    }, [isRepublicDay]);

    useEffect(() => {
        const replay = () => { if (isRepublicDay) setStage('black'); };
        window.addEventListener('replay-cinematic', replay);
        return () => window.removeEventListener('replay-cinematic', replay);
    }, [isRepublicDay]);

    // Timeline
    useEffect(() => {
        if (stage === 'black') setTimeout(() => setStage('text1'), 1500);
        else if (stage === 'text1') setTimeout(() => setStage('text2'), 3000);
        else if (stage === 'text2') setTimeout(() => setStage('main'), 3000);
        else if (stage === 'main') {
            sessionStorage.setItem("cinematic_rd_2026_v4", "true");
        }
    }, [stage]);

    if (stage === 'idle' || stage === 'exit') return null;

    return (
        <AnimatePresence>
            <style>{styles}</style>

            {/* FULL SCREEN OVERLAY */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-[#050505] overflow-hidden flex items-center justify-center font-sans"
            >
                {/* CINEMATIC BARS */}
                <CinemaBars />

                {/* BACKGROUND ATMOSPHERE */}
                <div className="absolute inset-0 spotlight opacity-30 pointer-events-none"></div>
                <CinematicDust />

                {/* ---------------- SCENE 1: THE PREAMBLE ---------------- */}
                {stage === 'text1' && (
                    <motion.div
                        key="t1"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 1.5 }}
                        className="text-center z-50 text-white"
                    >
                        <h2 className="text-2xl md:text-3xl font-light tracking-[0.5em] uppercase text-gray-400 mb-4">
                            One Nation
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-bold cinematic-text tracking-widest">
                            ONE SPIRIT
                        </h1>
                    </motion.div>
                )}

                {/* ---------------- SCENE 2: THE LEGACY ---------------- */}
                {stage === 'text2' && (
                    <motion.div
                        key="t2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                        transition={{ duration: 1.5 }}
                        className="text-center z-50 text-white"
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF9933] to-white drop-shadow-lg">
                            77 YEARS
                        </h1>
                        <div className="h-px w-32 bg-white/30 mx-auto my-6"></div>
                        <p className="text-xl tracking-[0.3em] uppercase text-gray-300">
                            Of Sovereignty
                        </p>
                    </motion.div>
                )}

                {/* ---------------- SCENE 4: THE POSTER (MAIN) ---------------- */}
                {stage === 'main' && (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative z-50 w-full h-full flex items-center justify-center p-4 md:p-12 mb-10"
                    >
                        {/* Background Spin */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png" className="w-[80vh] h-[80vh] animate-spin-slow invert" alt="" />
                        </div>

                        <TiltCard>
                            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row">

                                {/* Close Button UI */}
                                <div className="absolute top-6 right-6 z-50 flex gap-2">
                                    <button onClick={() => setStage('exit')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* LEFT: VISUAL (WAVING FLAG) */}
                                <div className="w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#FF9933]/20 to-black p-12 flex items-center justify-center">
                                    <motion.div
                                        className="relative z-10"
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                    >
                                        {/* Real SVG Flag with CSS Wave Animation */}
                                        <div className="flag-wave-container w-[350px]">
                                            {/* Glimmer effect for ripple */}
                                            <div className="flag-glimmer z-20"></div>
                                            <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="w-full h-auto object-cover border-2 border-white/5" alt="Flag" />
                                        </div>
                                        {/* Reflection on 'floor' */}
                                        <div className="h-16 w-full bg-gradient-to-b from-white/10 to-transparent transform scale-y-[-1] opacity-30 mask-image-b blur-sm mt-4 rounded-full"></div>
                                    </motion.div>
                                </div>

                                {/* RIGHT: TEXT */}
                                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center text-left">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1 }}
                                    >
                                        <h4 className="text-[#FF9933] font-bold tracking-[0.2em] uppercase mb-2 text-sm">26 January 2026</h4>
                                        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                                            Happy<br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">Republic Day</span>
                                        </h1>
                                        <p className="text-gray-400 font-light text-lg leading-relaxed mb-8 max-w-md">
                                            Honoring the Constitution that unites us all. Today, we celebrate the spirit of justice, liberty, and equality.
                                        </p>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setStage('exit')}
                                            className="group relative px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded-sm overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                Jai Hind
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>
                )}

            </motion.div>
        </AnimatePresence>
    );
}

export function RepublicDayBanner() {
    const isRepublicDay = useRepublicDayCheck();
    if (!isRepublicDay) return null;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={triggerRepublicDayReplay}
            className="mb-6 relative overflow-hidden rounded-xl shadow-2xl border-none cursor-pointer group bg-gradient-to-r from-gray-900 to-black border-l-4 border-[#FF9933]"
        >
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png')] bg-contain bg-no-repeat opacity-[0.03] translate-x-10 translate-y-10 group-hover:rotate-12 transition-transform duration-700"></div>

            <div className="relative z-10 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                alt="Emblem"
                                className="w-8 h-auto invert opacity-90"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-2xl tracking-tighter">
                            <span className="text-[#FF9933]">BHARAT</span> <span className="text-white">GANARAJYA</span>
                        </h3>
                        <p className="text-xs text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">
                            77th Republic Day Celebration
                        </p>
                    </div>
                </div>

                <div className="flex gap-8 opacity-60 group-hover:opacity-100 transition-opacity">
                    {['Sovereign', 'Socialist', 'Secular', 'Democratic'].map((word, i) => (
                        <span key={word} className="text-[10px] font-bold uppercase tracking-widest text-gray-300 border-b border-gray-700 pb-1">{word}</span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
