"use client";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function AboutHero({ data }) {
    if (!data) return null;

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
            {/* Cinematic Background with Grain */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>

            {/* Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex justify-center mb-8"
                >
                    <div className="p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <Crown className="w-10 h-10 text-yellow-500" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-6xl md:text-8xl lg:text-[10rem] font-bruno leading-[0.9] bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent mb-6 tracking-tighter"
                >
                    {data.title}
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0, letterSpacing: "0.5em" }}
                    animate={{ opacity: 1, letterSpacing: "1.2em" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="text-xs md:text-sm lg:text-base font-bold text-yellow-500 uppercase tracking-[1.2em] ml-2 md:ml-4"
                >
                    {data.subtitle}
                </motion.h2>

                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 100 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="w-[1px] bg-gradient-to-b from-yellow-500/0 via-yellow-500 to-yellow-500/0 mx-auto mt-20"
                />
            </div>
        </section>
    );
}
