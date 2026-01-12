"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Search, Filter, Calendar, Check, X, Eye, Phone, Mail, Car, User, Clock,
  DollarSign, Menu, ChevronRight, RefreshCw, Layers
} from "lucide-react";
import { getAllRequests, acceptRequest, rejectRequest } from "@/app/components/data/requestService";
import Sidebar from "@/components/ui/sidebar";
import { usePermissions } from "@/app/hooks/usePermissions";
import { motion, AnimatePresence } from "framer-motion";

// --- Memoized Request Card Component ---
const RequestCard = memo(({ req, isOpen, onToggle, carImage, onAccept, onReject, canEdit }) => {
  const statusColors = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    accepted: "text-green-400 bg-green-400/10 border-green-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`group relative overflow-hidden rounded-3xl transition-all duration-300 border ${isOpen ? "bg-white/10 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]" : "bg-white/5 border-white/5 hover:border-white/10"
        }`}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="p-6 relative z-10" onClick={onToggle}>
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between cursor-pointer">
          {/* User & Car Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-yellow-500/20">
              {req.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bruno text-white truncate flex items-center gap-2">
                {req.name}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[req.status] || "text-gray-400"} uppercase tracking-wider font-sans font-bold`}>
                  {req.status}
                </span>
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Car size={14} className="text-yellow-500" />
                <span className="truncate">{req.car}</span>
                <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                <span className="font-mono text-yellow-500/80">{req.totalDays} Days</span>
              </div>
            </div>
          </div>

          {/* Dates & Price */}
          <div className="flex flex-wrap gap-4 lg:gap-8 items-center text-sm text-gray-400">
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              <Calendar size={14} className="text-yellow-500/70" />
              <span>{new Date(req.dateFrom).toLocaleDateString()} - {new Date(req.dateTo).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 min-w-[100px]">
              <DollarSign size={14} className="text-green-500" />
              <span className="text-white font-bold font-mono">{req.totalPrice}</span>
            </div>
          </div>

          {/* Expand Icon */}
          <div className={`p-2 rounded-full border border-white/10 transition-all duration-300 ${isOpen ? "bg-yellow-500 text-black rotate-90" : "bg-transparent text-gray-500 group-hover:text-white"}`}>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden"
            >
              {/* Car Image */}
              <div className="lg:col-span-1 h-48 rounded-2xl overflow-hidden relative border border-white/10">
                {carImage ? (
                  <img src={carImage} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy" alt="Car" />
                ) : (
                  <div className="w-full h-full bg-black/40 flex items-center justify-center text-gray-500 flex-col gap-2">
                    <Car size={32} className="opacity-20" />
                    <span className="text-xs uppercase tracking-widest">No Image Preview</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                  <h4 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-3">Client Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="p-2 rounded-lg bg-white/5"><Phone size={14} className="text-yellow-500" /></div>
                      {req.contact}
                    </div>
                    {req.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="p-2 rounded-lg bg-white/5"><Mail size={14} className="text-yellow-500" /></div>
                        {req.email}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-300 md:col-span-2">
                      <div className="p-2 rounded-lg bg-white/5"><Layers size={14} className="text-yellow-500" /></div>
                      Type: <span className="capitalize text-white">{req.rentalType || "Standard Rental"}</span>
                    </div>
                  </div>
                </div>

                {req.message && (
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                    <h4 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">Message</h4>
                    <p className="text-gray-300 text-sm leading-relaxed italic">"{req.message}"</p>
                  </div>
                )}

                {/* Actions */}
                {req.status === 'pending' && canEdit && (
                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={(e) => { e.stopPropagation(); onReject(req._id); }} className="px-6 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm flex items-center gap-2">
                      <X size={16} /> Reject
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAccept(req._id); }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:shadow-lg hover:shadow-yellow-500/20 transition-all font-bold text-sm flex items-center gap-2">
                      <Check size={16} /> Accept Request
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default function AdminRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [openRequestId, setOpenRequestId] = useState(null); // Accordion style: only one open at a time
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [carImages, setCarImages] = useState({});
  const { canEdit } = usePermissions();

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
      preloadCarImages(data);
    } catch (err) {
      console.error("Failed to load", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Preload images logic
  const preloadCarImages = async (requestsData) => {
    const ids = [...new Set(requestsData.map(r => r.carId).filter(Boolean))];
    if (!ids.length) return;
    try {
      const results = await Promise.all(ids.map(async id => {
        try {
          const res = await fetch(`/api/cars/${id}`);
          if (!res.ok) return { id, imageUrl: null };
          const car = await res.json();
          return { id, imageUrl: car.mainImage || car.image || null };
        } catch { return { id, imageUrl: null }; }
      }));
      const imgMap = {};
      results.forEach(r => { if (r.imageUrl) imgMap[r.id] = r.imageUrl; });
      setCarImages(prev => ({ ...prev, ...imgMap }));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleToggle = useCallback((id) => {
    setOpenRequestId(prev => prev === id ? null : id);
  }, []);

  const handleAction = useCallback(async (id, actionFn, status) => {
    try {
      const res = await actionFn(id);
      if (res.success) {
        setRequests(prev => prev.map(r => r._id === id || r.id === id ? { ...r, status } : r));
      } else {
        alert("Action failed: " + (res.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Action error");
    }
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchSearch = req.name?.toLowerCase().includes(searchTerm.toLowerCase()) || req.car?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="flex bg-black min-h-screen font-sans selection:bg-yellow-500/30">
      <div className="hidden lg:block sticky top-0 h-screen"><Sidebar /></div>

      <div className="flex-1 lg:ml-80 p-4 sm:p-8 lg:p-12 min-h-screen bg-black relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-bruno bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-3">
                RENTAL REQUESTS
              </h1>
              <p className="text-gray-400">Manage client inquiries with precision.</p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center min-w-[100px]">
                <span className="text-2xl font-bold text-yellow-500 font-bruno">{pendingCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Pending</span>
              </div>
              <button onClick={loadRequests} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-yellow-500 transition-colors">
                <RefreshCw size={24} />
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between bg-white/5 p-2 rounded-3xl border border-white/5 backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search requests..."
                className="w-full bg-transparent h-12 rounded-2xl pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:bg-white/5 transition-colors"
              />
            </div>
            <div className="flex bg-black/40 rounded-2xl p-1 gap-1 overflow-x-auto">
              {['all', 'pending', 'accepted', 'rejected'].map(stat => (
                <button
                  key={stat}
                  onClick={() => setStatusFilter(stat)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${statusFilter === stat ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "text-gray-400 hover:text-white"}`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="animate-pulse">Loading Requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                  <RequestCard
                    key={req._id || req.id}
                    req={req}
                    isOpen={openRequestId === (req._id || req.id)}
                    onToggle={() => handleToggle(req._id || req.id)}
                    carImage={carImages[req.carId]}
                    onAccept={(id) => handleAction(id, acceptRequest, "accepted")}
                    onReject={(id) => handleAction(id, rejectRequest, "rejected")}
                    canEdit={canEdit}
                  />
                ))
              ) : (
                <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                    <Search size={32} />
                  </div>
                  <p className="text-gray-400">No requests found matching your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}