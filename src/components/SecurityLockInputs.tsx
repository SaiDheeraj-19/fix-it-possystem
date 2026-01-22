"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lock, Key, Grid3X3, Smartphone } from "lucide-react";

interface SecurityLockInputsProps {
    onChange?: (value: string, mode: "PATTERN" | "PIN" | "PASSWORD" | "NONE") => void;
    initialMode?: "PATTERN" | "PIN" | "PASSWORD" | "NONE";
    initialValue?: string;
    readOnly?: boolean;
}

export const SecurityLockInputs: React.FC<SecurityLockInputsProps> = ({
    onChange,
    initialMode = "PATTERN",
    initialValue = "",
    readOnly = false,
}) => {
    const [mode, setMode] = useState<"PATTERN" | "PIN" | "PASSWORD" | "NONE">(initialMode);
    const [pin, setPin] = useState(initialMode === "PIN" ? initialValue : "");
    const [password, setPassword] = useState(initialMode === "PASSWORD" ? initialValue : "");

    const parsePattern = (str: string) => {
        if (!str) return [];
        return str.split('-').map(Number).filter(n => !isNaN(n));
    };

    const [patternPath, setPatternPath] = useState<number[]>(
        initialMode === "PATTERN" ? parsePattern(initialValue) : []
    );

    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (initialMode) setMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        if (initialValue) {
            if (initialMode === "PATTERN") setPatternPath(parsePattern(initialValue));
            else if (initialMode === "PIN") setPin(initialValue);
            else if (initialMode === "PASSWORD") setPassword(initialValue);
        }
    }, [initialValue, initialMode]);

    useEffect(() => {
        if (mode === 'NONE' && onChange) {
            onChange('', 'NONE');
        }
    }, [mode]);

    // Pattern Logic
    const DOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const getCoordinates = (index: number) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return { x: col * 80 + 40, y: row * 80 + 40 };
    };

    const handlePointerDown = (index: number) => {
        if (readOnly) return;
        setIsDrawing(true);
        setPatternPath([index]);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (readOnly || !isDrawing || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find which dot is near (80x80 grid)
        const col = Math.floor(x / 80);
        const row = Math.floor(y / 80);

        if (col >= 0 && col < 3 && row >= 0 && row < 3) {
            const index = row * 3 + col;

            // Check if pointer is close enough to the center of the dot (within 30px)
            const dotCenter = getCoordinates(index);
            const dist = Math.sqrt(Math.pow(x - dotCenter.x, 2) + Math.pow(y - dotCenter.y, 2));

            if (dist < 30 && !patternPath.includes(index)) {
                setPatternPath((prev) => [...prev, index]);
            }
        }
    };

    useEffect(() => {
        const handleUp = () => {
            if (isDrawing) {
                setIsDrawing(false);
                if (onChange) onChange(patternPath.join("-"), "PATTERN");
            }
        };
        window.addEventListener("pointerup", handleUp);
        return () => window.removeEventListener("pointerup", handleUp);
    }, [isDrawing, patternPath, onChange]);

    const handlePinClick = (digit: string) => {
        if (readOnly) return;
        if (pin.length < 8) {
            const newPin = pin + digit;
            setPin(newPin);
            if (onChange) onChange(newPin, "PIN");
        }
    };

    const handleBackspace = () => {
        if (readOnly) return;
        const newPin = pin.slice(0, -1);
        setPin(newPin);
        if (onChange) onChange(newPin, "PIN");
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (onChange) onChange(newPassword, "PASSWORD");
    };

    return (
        <div className={cn(
            "w-full max-w-sm mx-auto rounded-[3rem] p-4 shadow-2xl relative overflow-hidden transition-all",
            readOnly ? "bg-transparent border-0 shadow-none pointer-events-none" : "bg-black border-[8px] border-gray-800"
        )}>
            {/* Mobile Frame Header (Notch style) */}
            {!readOnly && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
            )}

            {/* Mode Tabs */}
            {!readOnly && (
                <div className="flex justify-center gap-4 mb-8 mt-8 px-2 relative z-10">
                    <button onClick={() => setMode("PATTERN")} className={cn("p-2 rounded-full transition-all", mode === "PATTERN" ? "bg-blue-600 shadow-lg shadow-blue-500/50 scale-110" : "bg-gray-800 text-gray-400")}>
                        <Grid3X3 className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => setMode("PIN")} className={cn("p-2 rounded-full transition-all", mode === "PIN" ? "bg-blue-600 shadow-lg shadow-blue-500/50 scale-110" : "bg-gray-800 text-gray-400")}>
                        <Smartphone className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => setMode("PASSWORD")} className={cn("p-2 rounded-full transition-all", mode === "PASSWORD" ? "bg-blue-600 shadow-lg shadow-blue-500/50 scale-110" : "bg-gray-800 text-gray-400")}>
                        <Key className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => setMode("NONE")} className={cn("p-2 rounded-full transition-all", mode === "NONE" ? "bg-blue-600 shadow-lg shadow-blue-500/50 scale-110" : "bg-gray-800 text-gray-400")}>
                        <div className="w-5 h-5 font-bold text-white text-[10px] flex items-center justify-center border-2 border-white rounded-full">/</div>
                    </button>
                </div>
            )}

            <div className={cn(
                "aspect-[9/16] relative flex flex-col items-center justify-center",
                readOnly ? "bg-transparent" : "bg-gray-950 rounded-2xl border border-gray-800"
            )}>
                {mode === "PATTERN" ? (
                    <div
                        ref={containerRef}
                        onPointerMove={handlePointerMove}
                        className="relative w-[240px] h-[240px] touch-none select-none"
                    >
                        {/* Background Grid Dots */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                            {DOTS.map(dot => (
                                <div key={dot} className="flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-600 rounded-full opacity-50"></div>
                                </div>
                            ))}
                        </div>

                        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                            {/* Glow Filter */}
                            <defs>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {patternPath.length > 0 && (
                                <polyline
                                    points={patternPath.map((i) => {
                                        const { x, y } = getCoordinates(i);
                                        return `${x},${y}`;
                                    }).join(" ")}
                                    fill="none"
                                    stroke={readOnly ? "#4ade80" : "#3b82f6"}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                    className="opacity-90"
                                />
                            )}
                        </svg>
                        <div className="grid grid-cols-3 gap-0 w-full h-full relative z-30">
                            {DOTS.map((dot) => {
                                const isActive = patternPath.includes(dot);
                                return (
                                    <div
                                        key={dot}
                                        className="flex items-center justify-center cursor-pointer"
                                        onPointerDown={() => handlePointerDown(dot)}
                                    >
                                        <div className={cn(
                                            "transition-all duration-300 rounded-full border-2",
                                            isActive
                                                ? (readOnly ? "w-4 h-4 bg-green-400 border-green-200 shadow-[0_0_15px_#4ade80]" : "w-4 h-4 bg-blue-500 border-blue-200 shadow-[0_0_15px_#3b82f6]")
                                                : "w-2 h-2 bg-gray-500 border-transparent hover:w-4 hover:h-4 hover:border-gray-400"
                                        )} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : mode === "PIN" ? (
                    <div className="w-full h-full flex flex-col items-center justify-end pb-12">
                        <div className="mb-12 w-full flex justify-center space-x-4 h-4">
                            {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all duration-200",
                                        i < pin.length ? (readOnly ? "bg-green-500 shadow-[0_0_8px_#4ade80]" : "bg-white shadow-[0_0_8px_white]") : "bg-gray-700"
                                    )}
                                />
                            ))}
                        </div>
                        {!readOnly ? (
                            <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => handlePinClick(n.toString())}
                                        className="w-16 h-16 rounded-full bg-gray-800/50 backdrop-blur-md text-white text-2xl font-light hover:bg-gray-700 active:scale-95 flex items-center justify-center transition-all border border-gray-700/50"
                                    >
                                        {n}
                                    </button>
                                ))}
                                <div />
                                <button
                                    type="button"
                                    onClick={() => handlePinClick("0")}
                                    className="w-16 h-16 rounded-full bg-gray-800/50 backdrop-blur-md text-white text-2xl font-light hover:bg-gray-700 active:scale-95 flex items-center justify-center transition-all border border-gray-700/50"
                                >
                                    0
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackspace}
                                    className="w-16 h-16 rounded-full bg-transparent text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                                >
                                    <span className="text-xl">✕</span>
                                </button>
                            </div>
                        ) : (
                            <h3 className="text-3xl font-mono text-green-400 tracking-[0.5em]">{pin}</h3>
                        )}
                    </div>
                ) : mode === "NONE" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="p-6 rounded-full bg-gray-800/30 mb-6 border border-gray-700">
                            <Lock className="w-12 h-12 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No Security Lock</h3>
                        <p className="text-gray-500 text-sm">Customer refused or device has no lock.</p>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                        <div className="p-6 rounded-full bg-gray-800/50 mb-6">
                            <Lock className="w-12 h-12 text-blue-500" />
                        </div>
                        <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-medium">Enter Password</p>
                        {readOnly ? (
                            <div className="text-2xl text-green-400 font-mono tracking-wider break-all text-center">
                                {password}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Password"
                                className="w-full max-w-[260px] bg-transparent border-b-2 border-gray-700 px-2 py-3 text-white text-center text-xl focus:border-blue-500 outline-none transition-colors"
                            />
                        )}
                    </div>
                )}
            </div>

            {!readOnly && (
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Secure Encryption</p>
                </div>
            )}
        </div>
    );
};
