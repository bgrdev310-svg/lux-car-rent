"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const getStatusBadge = (status) => {
    const styles = {
        "Accepted": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        "Pending": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        "Rejected": "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return `px-4 py-1.5 rounded-full text-xs font-bold uppercase border tracking-wider ${styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`;
};

export default function BookingCard({ booking, index }) {
    const car = booking.carId || {};
    const price = booking.totalPrice || booking.price || car.pricing?.daily || 0;

    // Default specs if missing
    const specs = car.specs && car.specs.length > 0 ? car.specs : [
        { label: "V10", icon: "/img/car-engine.png" },
        { label: "640 HP", icon: "/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png" },
        { label: "5.2L", icon: "/img/fuel-station.png" } // Fallbacks
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0a0a0a] rounded-3xl border border-white/5 hover:border-yellow-500/30 overflow-hidden group transition-all duration-300 relative"
        >
            <div className="flex flex-col lg:flex-row">
                {/* Left: Image Section */}
                <div className="lg:w-2/5 relative h-64 lg:h-auto overflow-hidden">
                    <img
                        src={car.mainImage || booking.image || '/img/default-car.jpg'}
                        alt={car.title || "Car Image"}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 lg:opacity-60" />

                    {/* Status Badge (Mobile Overlay) */}
                    <div className="absolute top-4 right-4 z-10 lg:hidden">
                        <span className={`backdrop-blur-md bg-black/50 ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between relative bg-gradient-to-br from-white/5 to-transparent">
                    {/* Texture */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl lg:text-3xl font-bruno text-white mb-2 group-hover:text-yellow-500 transition-colors">
                                {car.title || booking.title || `${car.brand} ${car.model}`}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                                <span className="bg-white/5 px-2 py-1 rounded-md">{booking.dateFrom ? new Date(booking.dateFrom).toLocaleDateString() : 'TBD'}</span>
                                <span className="text-yellow-500">➜</span>
                                <span className="bg-white/5 px-2 py-1 rounded-md">{booking.dateTo ? new Date(booking.dateTo).toLocaleDateString() : 'TBD'}</span>
                            </div>
                        </div>
                        {/* Status Badge (Desktop) */}
                        <div className="hidden lg:block">
                            <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                        </div>
                    </div>

                    {/* Car Specs (Restored) */}
                    <div className="flex gap-4 mb-6">
                        {specs.slice(0, 3).map((spec, i) => (
                            <div key={i} className="flex flex-col items-center justify-center w-16 h-16 bg-[#1a1a1a] rounded-2xl border border-white/5 group-hover:border-yellow-500/20 transition-colors">
                                {spec.icon ? (
                                    <img src={spec.icon} alt={spec.label} className="w-5 h-5 mb-1 opacity-70 group-hover:opacity-100 transition-opacity invert" />
                                ) : (
                                    <span className="text-lg mb-1">⚙️</span>
                                )}
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{spec.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer: Price & Action */}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                        <div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Total Cost</div>
                            <div className="text-xl font-bruno text-white">
                                AED <span className="text-yellow-500">{price.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link href={`/cars/${car._id}`}>
                            <button className="px-6 py-3 rounded-xl font-bruno text-xs uppercase tracking-widest text-[#050505] bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 active:scale-95">
                                View Details
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
