"use client";
import { motion } from "framer-motion";

export default function GarageHeader() {
    return (
        <div className="flex flex-col items-center my-10 md:my-16 text-center">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bruno text-4xl md:text-7xl text-white mb-4"
            >
                Your Dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-[#FF9D00]">Garage</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-sans text-gray-400 text-sm md:text-lg max-w-2xl"
            >
                View your selected cars and favorites. Manage your rentals and get ready to drive in style.
            </motion.p>
        </div>
    );
}
