"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, ChevronRight, Award, Car, Activity, Clock, Calendar, Users, Shield, Disc, Fuel, Zap, Check, Plus, Search, Trash, Edit, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/sidebar";
import CarManagementPanel from "@/components/admin/CarManagementPanel";

// Component for spec inputs
function SpecInput({ icon, value, onChange }) {
  return (
    <div className="bg-gray-800 p-3 rounded flex items-center space-x-3">
      <span className="text-yellow-500">{icon}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white flex-grow outline-none"
      />
    </div>
  );
}
// Main Cars Management Page Component - Complete implementation with fixed search, delete and modify

export default function CarsManagementPage() {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cars, setCars] = useState([]);

  // Fetch cars from API on mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch("/api/cars");
        if (!response.ok) throw new Error("Failed to fetch cars");
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };
    fetchCars();
  }, []);

  // Add car via API
  const handleAddCar = async (carData) => {
    try {
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error("Failed to add car");
      const newCar = await response.json();
      setCars((prev) => [...prev, newCar]);
      setShowCreatePanel(false);
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  // Update car via API
  const handleUpdateCar = async (carData) => {
    try {
      const response = await fetch(`/api/cars/${carData._id || carData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error("Failed to update car");
      const updatedCar = await response.json();
      setCars((prev) => prev.map((car) => (car._id === updatedCar._id ? updatedCar : car)));
      setEditingCar(null);
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  // Delete car via API
  const handleDeleteCar = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      const response = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete car");
      setCars((prev) => prev.filter((car) => car._id !== id && car.id !== id));
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  // Function to start editing a car
  const handleEditCar = (car) => {
    setEditingCar(car);
  };

  // Function to filter cars based on search term
  const filteredCars = cars.filter(car => {
    if (!searchTerm.trim()) return true;
    const searchFields = [
      car.brand,
      car.title,
      car.model,
      car.price,
      car.fuelType,
      car.year,
      ...(car.features || [])
    ].map(field => String(field).toLowerCase());
    const searchTermLower = searchTerm.toLowerCase().trim();
    return searchFields.some(field => field.includes(searchTermLower));
  });

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 relative z-0 overflow-x-hidden bg-black min-h-screen text-white lg:ml-64">
        {/* Admin Header - Responsive */}
        <div className="flex flex-col justify-between items-center p-4 sm:p-6 bg-black">
          <div className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 sm:mb-8 lg:mb-11 mt-2 font-bruno text-center">
            CARS MANAGEMENT
          </div>

          {/* Search and Create Button - Responsive Layout */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl gap-4 sm:gap-6">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-yellow-800/50 text-white font-bruno px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full w-full sm:w-64 md:w-72 lg:w-80 pr-10 sm:pr-12 text-sm sm:text-base"
              />
              <Search
                size={20}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-yellow-400"
              />
            </div>

            <button
              onClick={() => {
                setEditingCar(null);
                setShowCreatePanel(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 sm:px-6 lg:px-8 text-sm sm:text-lg lg:text-xl py-2 sm:py-3 lg:py-4 font-bruno rounded-full flex items-center space-x-2 transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Plus size={16} className="sm:hidden" />
              <Plus size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-base lg:text-lg">CREATE NEW</span>
            </button>
          </div>
        </div>

        {/* Cars List - Responsive Grid */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {filteredCars.length > 0 ? (
            filteredCars.map(car => (
              <CarListItem
                key={car._id}
                car={car}
                onDelete={handleDeleteCar}
                onEdit={handleEditCar}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <div className="text-xl sm:text-2xl font-bruno mb-2">NO CARS FOUND</div>
              <p className="text-sm sm:text-base">Try changing your search criteria or add a new car</p>
            </div>
          )}
        </div>

        {/* Create/Edit Car Panel Modal with Animation */}
        <AnimatePresence>
          {(showCreatePanel || editingCar) && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:pl-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreatePanel(false);
                setEditingCar(null);
              }}
            >
              <motion.div
                className="w-full max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CarManagementPanel
                  existingCar={editingCar}
                  onClose={() => {
                    setShowCreatePanel(false);
                    setEditingCar(null);
                  }}
                  onSave={editingCar ? handleUpdateCar : handleAddCar}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
// Car List Item Component - Fixed Mobile Layout

function CarListItem({ car, onDelete, onEdit }) {
  return (
    <div className="w-full px-2 sm:px-4 mb-6 md:mb-8 group">
      {/* Container with Premium Border and Gradient */}
      {/* Container with Ultra-Premium Glass & Gold Theme */}
      <div className="relative bg-[#030303]/70 backdrop-blur-3xl rounded-3xl border border-white/[0.08] overflow-hidden transition-all duration-700 hover:border-yellow-500/50 hover:shadow-[0_30px_80px_-20px_rgba(234,179,8,0.15)] group-hover:bg-[#050505]/90 group">

        {/* Cinematic Gold Lighting & Brush Effects */}
        {/* Top-Right "Spotlight" Glow */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 bg-gradient-to-br from-yellow-500/20 to-orange-600/5 rounded-full blur-[80px] pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

        {/* Bottom-Left Ambient Gold */}
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-yellow-600/5 rounded-full blur-[60px] pointer-events-none opacity-30" />

        {/* "Brush Stroke" Accent - Dynamic Diagonal Sheen */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

        {/* Subtle Noise Texture for "Material" Feel (Optional - simplified to gradient for now) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-stretch h-[270px]">

          {/* Image Section - Cinematic Aspect Ratio */}
          <div className="relative w-full lg:w-[350px] xl:w-[400px] shrink-0 overflow-hidden">
            {/* Gradient Overlay for Text Readability/Mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/90" />

            {/* Image Hover Effect */}
            <img
              src={car.mainImage || car.image || '/img/default-car.jpg'}
              alt={car.title}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            />
            {/* Inner Shadow Overlay for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] z-20 pointer-events-none" />

            {/* Price Badge (Mobile/Tablet Only) - Floating */}
            <div className="absolute top-4 right-4 z-20 lg:hidden">
              <div className="bg-black/80 backdrop-blur-md border border-yellow-500/30 px-3 py-1 rounded-lg shadow-lg">
                <span className="text-yellow-400 font-bruno text-sm">
                  {car.pricing?.daily || car.price ? `${car.pricing?.daily || car.price} $` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Logo Overlay (Desktop) */}
            {car.logo && (
              <div className="absolute bottom-4 left-4 z-20 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <img src={car.logo} alt="logo" className="w-14 h-14 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </div>
            )}
          </div>

          {/* Desktop Vertical Specs Section - "Cockpit" Style */}
          <div className="hidden lg:flex flex-col justify-center items-center py-3 pl-5 pr-2 z-20">
            <div className="flex flex-col bg-transparent border border-white/5 rounded-2xl w-20 h-[90%] overflow-hidden transition-all duration-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.1)]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center justify-center flex-1 py-1 border-b border-white/5 last:border-0 relative group/icon hover:bg-white/[0.02] transition-colors">
                  {/* Vertical "Tech" Line accent */}
                  <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-yellow-500/0 group-hover/icon:bg-yellow-500 transition-colors duration-300 rounded-r-full" />

                  <div className="mb-1 text-gray-400 group-hover/icon:text-yellow-400 transition-all duration-300 transform group-hover/icon:scale-110 group-hover/icon:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                    <img
                      src={car.specs && car.specs[i] && car.specs[i].icon ? car.specs[i].icon :
                        i === 0 ? '/img/car-engine.png' :
                          i === 1 ? '/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png' :
                            '/img/fuel-station.png'}
                      alt="spec"
                      className="h-6 w-6 object-contain opacity-80 group-hover/icon:opacity-100 transition-all duration-300"
                      style={{ filter: 'invert(69%) sepia(57%) saturate(2253%) hue-rotate(1deg) brightness(103%) contrast(97%)' }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 group-hover/icon:text-white transition-colors text-center px-1 font-bruno">
                    {car.specs && car.specs[i] && car.specs[i].label ? car.specs[i].label : '-'}
                  </span>
                  <span className="text-[8px] text-gray-600 group-hover/icon:text-yellow-500/70 uppercase tracking-widest scale-75">
                    {i === 0 ? 'TYPE' : i === 1 ? 'POWER' : 'FUEL'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between relative z-20 overflow-hidden">

            {/* Header: Title & Brand */}
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center space-x-4">
                {car.logo && (
                  <div className="lg:hidden w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center p-2 backdrop-blur-sm">
                    <img src={car.logo} alt="logo" className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bruno text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 group-hover:from-yellow-200 group-hover:via-yellow-400 group-hover:to-yellow-600 transition-all duration-300 truncate max-w-[200px] xl:max-w-none">
                    {car.title || `${car.brand} ${car.model}`}
                  </h3>

                  {/* Features List (Single Column, Larger Text) */}
                  <div className="mt-5">
                    <ul className="flex flex-col gap-1.5">
                      {car.features?.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-center text-xs uppercase tracking-wide text-gray-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2.5 shrink-0 opacity-80"></span>
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {car.features?.length > 5 && (
                        <li className="text-xs text-yellow-500/70 italic pl-4 mt-0.5">
                          +{car.features.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Desktop Status Badge */}
              <div className="hidden lg:flex flex-col items-end">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${car.state === "Available" ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"}`}>
                  {car.state}
                </span>
              </div>
            </div>

            {/* Mobile Specs Grid (Hidden on Desktop) */}
            <div className="lg:hidden grid grid-cols-3 gap-2 sm:gap-4 my-3 bg-white/[0.03] rounded-xl p-2 border border-white/[0.05]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center justify-center border-r border-white/10 last:border-0 px-2">
                  <div className="mb-1 text-gray-500">
                    <img
                      src={car.specs && car.specs[i] && car.specs[i].icon ? car.specs[i].icon :
                        i === 0 ? '/img/car-engine.png' :
                          i === 1 ? '/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png' :
                            '/img/fuel-station.png'}
                      alt="spec"
                      className="h-4 w-4 object-contain opacity-60"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">
                    {car.specs && car.specs[i] && car.specs[i].label ? car.specs[i].label : '-'}
                  </span>
                </div>
              ))}
            </div>


            {/* Footer: Price & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto border-t border-white/5 pt-3">

              {/* Price Section */}
              <div className="text-center sm:text-left">
                <div className="text-gray-500 text-[9px] tracking-[0.2em] uppercase mb-0.5">Daily Rate</div>
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-xl sm:text-2xl font-bruno text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                    {car.pricing?.daily || car.price ? `${car.pricing?.daily || car.price}` : 'N/A'}
                  </span>
                  <span className="text-yellow-600 text-base">$</span>
                </div>
              </div>

              {/* Action Buttons */}
              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(car); }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] hover:bg-yellow-500 border border-white/10 hover:border-yellow-400 text-gray-400 hover:text-black transition-all duration-300 group/btn shadow-lg shadow-black/50 hover:shadow-yellow-500/20"
                >
                  <Edit size={14} className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-widest">EDIT</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(car._id || car.id); }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] hover:bg-red-500 border border-white/10 hover:border-red-400 text-gray-400 hover:text-white transition-all duration-300 group/delete shadow-lg shadow-black/50 hover:shadow-red-500/20"
                >
                  <Trash size={14} className="group-hover/delete:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-widest">DELETE</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

