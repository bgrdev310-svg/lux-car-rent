"use client";
import { motion } from "framer-motion";
import { Shield, Zap, Crown, Clock, Star, Globe } from "lucide-react";

const features = [
    {
        icon: <Crown size={32} />,
        title: "Royalty Treatment",
        desc: "Every client is treated as a VIP, with white-glove service standard on all rentals.",
        colSpan: "md:col-span-2",
        bg: "bg-gradient-to-br from-yellow-900/20 to-black",
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop" // Rolls Royce / Luxury Vibe
    },
    {
        icon: <Shield size={32} />,
        title: "Platinum Insurance",
        desc: "Comprehensive coverage for complete peace of mind.",
        colSpan: "md:col-span-1",
        bg: "bg-[#0a0a0a]",
        image: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=1000&auto=format&fit=crop"
    },
    {
        icon: <Zap size={32} />,
        title: "Instant Delivery",
        desc: "From signing to driving in under 30 minutes. Anywhere in Dubai.",
        colSpan: "md:col-span-1",
        bg: "bg-[#0a0a0a]",
        image: "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1000&auto=format&fit=crop"
    },
    {
        icon: <Star size={32} />,
        title: "Mint Condition",
        desc: "Our fleet is maintained to showroom standards daily.",
        colSpan: "md:col-span-2",
        bg: "bg-gradient-to-tl from-zinc-900 to-black",
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop" // Aggressive dark car / Showroom
    }
];

export default function AboutFeatures({ data }) {
    if (!data) return null;

    return (
        <section className="py-24 bg-[#050505]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="mb-16">
                    <h2 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2">{data.subtitle}</h2>
                    <h3 className="text-4xl md:text-5xl font-bruno text-white">{data.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.items?.map((f, i) => {
                        // Dynamic Icon Mapping could be improved with a lookup object, but for now assuming name matches
                        const Icon = { Crown, Shield, Zap, Star, Globe, Clock }[f.icon] || Star;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`${f.colSpan} ${f.bg} relative group p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.05)] overflow-hidden`}
                            >
                                {/* Background Image */}
                                {f.image && (
                                    <img
                                        src={f.image}
                                        alt="Feature Background"
                                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                                    />
                                )}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"></div>

                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-yellow-500 z-10">
                                    <Icon size={32} />
                                </div>

                                <div className="relative z-10 h-full flex flex-col justify-end mt-20">
                                    <h4 className="text-2xl font-bruno text-white mb-3 group-hover:text-yellow-500 transition-colors">{f.title}</h4>
                                    <p className="text-gray-400 font-light leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
