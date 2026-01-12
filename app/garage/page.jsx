"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from '@/lib/api-config';
import { decodeJWT } from "@/lib/utils";
import Navbar from "../components/homepage/navbar";
import FooterSection from "../components/homepage/footer";
import GarageHeader from "../components/garage/GarageHeader";

// Lazy Load Card Components
const BookingCard = dynamic(() => import("../components/garage/BookingCard"), {
  loading: () => <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
});
const FavoriteCard = dynamic(() => import("../components/garage/FavoriteCard"), {
  loading: () => <div className="h-96 bg-white/5 rounded-3xl animate-pulse" />
});

export default function Garage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          router.push('/login?redirect=/garage');
          return;
        }

        // Fetch Bookings
        const reqRes = await fetch(getApiUrl("/api/requests/my"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (reqRes.ok) setBookings(await reqRes.json());

        // Fetch Favorites
        const favRes = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
        if (favRes.ok) {
          const data = await favRes.json();
          setFavorites(data.favorites || []);
        }

      } catch (err) {
        console.error("Failed to load garage data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  return (
    <div className="bg-[#050505] min-h-screen font-sans selection:bg-yellow-500/30">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 pb-32 pt-24 min-h-screen">
        <GarageHeader />

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/5 p-1 rounded-full border border-white/10 flex gap-2">
            {['bookings', 'favorites'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-white'}`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-yellow-500 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />)}
            </motion.div>
          ) : activeTab === 'bookings' ? (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-5xl mx-auto"
            >
              {bookings.length > 0 ? (
                bookings.map((booking, i) => (
                  <BookingCard key={booking._id || i} booking={booking} index={i} />
                ))
              ) : (
                <EmptyState
                  icon="🏎️"
                  title="No Bookings Yet"
                  desc="Your garage is empty. Time to change that."
                  action={() => router.push('/cars')}
                  btnText="Browse Fleet"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {favorites.length > 0 ? (
                favorites.map((car, i) => (
                  <FavoriteCard key={car._id || i} car={car} index={i} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    icon="🖤"
                    title="No Favorites"
                    desc="Save your dream cars here for quick access."
                    action={() => router.push('/cars')}
                    btnText="Find Cars"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterSection />
    </div>
  );
}

// Simple internal Empty State component
const EmptyState = ({ icon, title, desc, action, btnText }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
    <div className="text-6xl mb-6 bg-white/5 p-6 rounded-full">{icon}</div>
    <h3 className="text-2xl font-bruno text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-8 max-w-sm">{desc}</p>
    <button
      onClick={action}
      className="px-8 py-3 bg-yellow-500 text-black font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors"
    >
      {btnText}
    </button>
  </div>
);