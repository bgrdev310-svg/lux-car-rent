"use client";
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BrandSelectionModal({ isOpen, onClose, brands, selectedBrand, onSelect }) {
    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                    >
                        {/* Gold Glow Top */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 opacity-50" />

                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl z-20 shrink-0">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-bruno tracking-wide mb-1">
                                    SELECT A BRAND
                                </h2>
                                <p className="text-gray-400 text-sm md:text-base">Choose a manufacturer to view their fleet.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-all group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Grid Content */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10 text-white">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {/* All Brands Option */}
                                <motion.button
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelect(null)}
                                    className={cn(
                                        "aspect-square rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 border relative overflow-hidden group text-center",
                                        !selectedBrand
                                            ? "bg-gradient-to-br from-yellow-500/20 to-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                            : "bg-[#111] border-white/5 hover:border-yellow-500/50 hover:bg-[#1a1a1a]"
                                    )}
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-yellow-500/20 transition-colors">
                                        <span className="font-bruno text-xl md:text-2xl text-yellow-500">ALL</span>
                                    </div>
                                    <span className="font-bruno text-sm md:text-base text-gray-300 group-hover:text-white">All Brands</span>
                                    {!selectedBrand && (
                                        <div className="absolute top-3 right-3 text-yellow-500">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </motion.button>

                                {/* Brand List */}
                                {brands.map((brand) => (
                                    <motion.button
                                        key={brand._id || brand.name}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onSelect(brand.name)}
                                        className={cn(
                                            "aspect-square rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 border relative overflow-hidden group",
                                            selectedBrand === brand.name
                                                ? "bg-gradient-to-br from-yellow-500/10 to-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                                : "bg-[#111] border-white/5 hover:border-yellow-500/50 hover:bg-[#1a1a1a]"
                                        )}
                                    >
                                        <div className="w-full h-16 md:h-20 mb-2 relative flex items-center justify-center">
                                            {brand.logo ? (
                                                <img
                                                    src={brand.logo}
                                                    alt={brand.name}
                                                    className="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-500">No Logo</span>
                                            )}
                                        </div>
                                        <h3 className={cn(
                                            "font-bruno text-xs md:text-sm text-center truncate w-full px-2 transition-colors",
                                            selectedBrand === brand.name ? "text-white" : "text-gray-400 group-hover:text-white"
                                        )}>
                                            {brand.name}
                                        </h3>

                                        {/* Selection Indicator */}
                                        {selectedBrand === brand.name && (
                                            <div className="absolute top-3 right-3 text-yellow-500 bg-yellow-500/10 rounded-full p-1">
                                                <Check size={14} />
                                            </div>
                                        )}

                                        {/* Hover Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/0 via-transparent to-transparent group-hover:from-yellow-500/10 transition-all duration-500 pointer-events-none" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
