"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function FavoriteCard({ car, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
        >
            <Link href={`/cars/${car._id}`} className="block h-full w-full">
                <img
                    src={car.mainImage || car.image || '/img/default-car.jpg'}
                    alt={car.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </Link>

            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-red-500 hover:text-white transition-colors border border-white/10">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-3xl font-bruno text-white mb-2">{car.title || `${car.brand} ${car.model}`}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                        <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">{car.pricing?.daily} AED/day</span>
                        {car.specs && <span>{car.specs[0]?.label}</span>}
                    </div>

                    <Link href={`/cars/${car._id}`}>
                        <button className="w-full py-4 bg-white text-black font-bruno uppercase tracking-widest rounded-xl hover:bg-yellow-500 transition-colors opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                            Book Now
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
