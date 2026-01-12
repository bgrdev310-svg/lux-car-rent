"use client";
import { motion } from "framer-motion";
import React from 'react';

export default function AboutStory({ data }) {
    if (!data) return null;

    return (
        <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bruno text-white mb-8 leading-tight">
                            <span className="text-yellow-500">{data.titlePart1}</span> {data.titlePart2}
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6 font-light">
                            {data.description1}
                        </p>
                        <p className="text-gray-400 text-lg leading-relaxed font-light">
                            {data.description2}
                        </p>

                        <div className="mt-12 flex items-center gap-8">
                            {data.stats?.map((stat, idx) => (
                                <React.Fragment key={idx}>
                                    <div>
                                        <span className="block text-4xl font-bruno text-white">{stat.value}</span>
                                        <span className="text-xs uppercase tracking-widest text-yellow-500">{stat.label}</span>
                                    </div>
                                    {idx < data.stats.length - 1 && <div className="w-[1px] h-12 bg-white/10"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 relative group">
                            {/* Image Placeholder */}
                            <img
                                src={data.image}
                                alt="About Us visual"
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 bg-zinc-900"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>

                            <div className="absolute bottom-10 left-10 right-10 p-8 border-l-2 border-yellow-500 backdrop-blur-sm z-10">
                                <p className="font-bruno text-2xl text-white leading-tight drop-shadow-lg whitespace-pre-line">{data.quote}</p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
