"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const locations = [
    "Palm Jumeirah", "Downtown Dubai", "Dubai Marina", "Burj Al Arab",
    "DXB Airport", "Jumeirah Beach", "Dubai Mall", "Atlantis Resort",
    "DIFC", "Emirates Hills", "Dubai Creek", "Business Bay",
    "Madinat Jumeirah", "JBR Walk", "City Walk", "La Mer"
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const AboutLocations = ({ data }) => {
    if (!data) return null;

    return (
        <section className="relative py-20 lg:py-32 bg-[#050505] overflow-hidden">
            {/* Ambient Background Glows - Deep Gold/Dark */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#B38728]/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-8 relative z-10">

                {/* Header Section */}
                <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bruno font-bold mb-6">
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                {data.title?.split(' ')[0] || 'Elite'}
                            </span>
                            <span className="bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#B38728] bg-clip-text text-transparent ml-3 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                                {data.title?.split(' ').slice(1).join(' ') || 'Destinations'}
                            </span>
                        </h2>

                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent mx-auto rounded-full opacity-60 mb-8" />

                        <p className="text-lg lg:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                            {data.subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Locations Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto"
                >
                    {data.list?.map((location, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-md" />

                            <div className="relative h-full p-6 lg:p-8 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/5 hover:border-[#FFD700]/40 transition-all duration-300 flex flex-col items-center justify-center text-center group-hover:transform group-hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                                <div className="w-12 h-12 mb-4 rounded-full bg-[#FFD700]/10 flex items-center justify-center group-hover:bg-[#FFD700]/20 transition-colors duration-300">
                                    <MapPin className="w-6 h-6 text-[#FFD700] group-hover:scale-110 transition-transform duration-300" />
                                </div>

                                <h3 className="text-gray-300 font-sans font-medium text-sm lg:text-lg group-hover:text-white transition-colors duration-300">
                                    {location}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>


                {/* SEO Keyword Context (Hidden visually but robust for crawlers if needed, though visible text above is good. Adding structured data could be a future step, but semantic tags here are solid) */}

            </div>
        </section>
    );
};

export default AboutLocations;
