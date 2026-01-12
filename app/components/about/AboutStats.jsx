"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutCallToAction({ data }) {
    if (!data) return null;

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute bottom-0 w-full h-[500px] bg-gradient-to-t from-yellow-600/10 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-bruno text-white mb-8"
                >
                    {data.titlePart1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">{data.titlePart2}</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto mb-12"
                >
                    {data.subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <Link href="/cars" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-yellow-500 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-yellow-500/20 group">
                        {data.buttonText}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
