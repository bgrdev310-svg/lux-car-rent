"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, Plus, Eye, EyeOff, Trash2, Upload, Camera, ChevronRight, Check, Search, Layout, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminUser } from '../AdminUserProvider';
import Sidebar from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Brand Context
const BrandContext = createContext();

const popularDubaiBrands = [
  { name: "Rolls Royce" },
  { name: "Bugatti" },
  { name: "McLaren" },
  { name: "Aston Martin" },
  { name: "Porsche" },
  { name: "Maserati" },
  { name: "BMW" },
  { name: "Audi" },
  { name: "Jaguar" },
  { name: "Land Rover" }
];

const API_URL = '/api';

// --- Components ---

// Premium Skeleton Loader
const SkeletonLoader = () => (
  <div className="w-full h-full flex flex-col space-y-8 animate-pulse text-white p-8">
    <div className="h-12 w-1/3 bg-white/5 rounded-2xl mx-auto mb-10 shimmer"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-64 bg-white/5 rounded-3xl shimmer"></div>
      <div className="h-64 bg-white/5 rounded-3xl shimmer"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-48 bg-white/5 rounded-3xl shimmer"></div>
      <div className="h-48 bg-white/5 rounded-3xl shimmer"></div>
    </div>
    <div className="h-96 bg-white/5 rounded-3xl shimmer mt-8"></div>
    <style jsx>{`
            .shimmer {
                background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%);
                background-size: 200% 100%;
                animation: shimmer 2s infinite;
            }
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `}</style>
  </div>
);

// Glass Container
const GlassContainer = ({ children, className, hoverEffect = false }) => (
  <div className={cn(
    "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden",
    hoverEffect && "group hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]",
    className
  )}>
    {children}
  </div>
);

// Gold Gradient Button
const GoldButton = ({ children, onClick, className, icon: Icon }) => (
  <button
    onClick={onClick}
    className={cn(
      "bg-gradient-to-r from-[#FFBB00] to-[#FF9D00] text-black font-bruno font-bold py-3 px-6 rounded-full",
      "hover:shadow-[0_0_20px_rgba(255,187,0,0.4)] hover:scale-105 transition-all duration-300",
      "flex items-center justify-center space-x-2 text-sm sm:text-base tracking-wider",
      className
    )}
  >
    {Icon && <Icon size={18} strokeWidth={2.5} />}
    <span>{children}</span>
  </button>
);


// Brand Provider
const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [logoData, setLogoData] = useState(null);
  const [galleryData, setGalleryData] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('Lamborghini'); // Default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetching with individual error handling handling implicitly via Promise.all for simplicity first
        // Optimization: Use Promise.allSettled to allow partial loading if one fails
        const results = await Promise.allSettled([
          fetch(`${API_URL}/brands`),
          fetch(`${API_URL}/hero`),
          fetch(`${API_URL}/logo`),
          fetch(`${API_URL}/gallery`)
        ]);

        const [brandsRes, heroRes, logoRes, galleryRes] = results;

        if (brandsRes.status === 'fulfilled' && brandsRes.value.ok) setBrands(await brandsRes.value.json());
        if (heroRes.status === 'fulfilled' && heroRes.value.ok) setHeroData(await heroRes.value.json());
        if (logoRes.status === 'fulfilled' && logoRes.value.ok) setLogoData(await logoRes.value.json());
        if (galleryRes.status === 'fulfilled' && galleryRes.value.ok) setGalleryData(await galleryRes.value.json());

      } catch (err) {
        console.error("Fetch Error:", err);
        setError("One or more resources failed to load. Please refresh.");
      } finally {
        setTimeout(() => setLoading(false), 500); // Artificial delay to ensure smooth transition
      }
    };
    fetchData();
  }, []);

  // Use generic fetch wrapper for duplicate logic
  const apiCall = async (url, method, body) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Failed to ${method} ${url}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      // Optional: Global error toast
    }
  };

  const addBrand = async (newBrand) => {
    const savedBrand = await apiCall(`${API_URL}/brands`, 'POST', newBrand);
    if (savedBrand) setBrands(prev => [...prev, savedBrand]);
  };

  const updateBrand = async (id, updatedBrand) => {
    const updated = await apiCall(`${API_URL}/brands/${id}`, 'PATCH', updatedBrand);
    if (updated) setBrands(prev => prev.map(brand => brand._id === id ? updated : brand));
  };

  const deleteBrand = async (id) => {
    try {
      const res = await fetch(`${API_URL}/brands/${id}`, { method: 'DELETE' });
      if (res.ok) setBrands(prev => prev.filter(brand => brand._id !== id));
    } catch (err) { console.error(err); }
  };

  const toggleBrandVisibility = async (id) => {
    const brand = brands.find(b => b._id === id);
    if (!brand) return;
    await updateBrand(id, { isActive: !brand.isActive });
  };

  const updateHeroBackground = async (imageUrl) => {
    const updated = await apiCall(`${API_URL}/hero`, 'PUT', { ...heroData, backgroundImage: imageUrl });
    if (updated) setHeroData(updated);
  };

  const updateHeroCarCard = async (carCardData) => {
    const updated = await apiCall(`${API_URL}/hero`, 'PUT', { ...heroData, carCard: { ...heroData.carCard, ...carCardData } });
    if (updated) setHeroData(updated);
  };

  const updateLogo = async (logoData) => {
    const updated = await apiCall(`${API_URL}/logo`, 'PUT', logoData);
    if (updated) setLogoData(updated);
  };

  const updateGallery = async (galleryData) => {
    const updated = await apiCall(`${API_URL}/gallery`, 'PUT', galleryData);
    if (updated) setGalleryData(updated);
  };

  const getVisibleBrands = () => brands.filter(brand => brand.isActive);

  return (
    <BrandContext.Provider value={{
      brands, heroData, logoData, galleryData, selectedBrand, popularDubaiBrands,
      setSelectedBrand, addBrand, updateBrand, deleteBrand, toggleBrandVisibility,
      updateHeroBackground, updateHeroCarCard, updateLogo, updateGallery, getVisibleBrands,
      loading, error
    }}>
      {children}
    </BrandContext.Provider>
  );
};

const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) throw new Error('useBrand must be used within a BrandProvider');
  return context;
};

// --- Modals (Premium Design) ---

const ModalWrapper = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className={cn(
            "relative bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]",
            maxWidth
          )}
        >
          {/* Gold Glow Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 opacity-50" />

          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl z-20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-bruno tracking-wide">
              {title}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors group">
              <X className="text-gray-400 group-hover:text-yellow-400" size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10 text-white">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const AdminBrandModal = ({ isOpen, onClose }) => {
  const { brands, popularDubaiBrands, addBrand, updateBrand, deleteBrand, toggleBrandVisibility } = useBrand();
  const user = useAdminUser();
  const isManager = user?.role === 'manager';
  const [view, setView] = useState('list'); // list, add, popular
  const [editingBrand, setEditingBrand] = useState(null);
  const [newBrand, setNewBrand] = useState({ name: '', logo: '', description: '', isVisible: true });

  const resetForm = () => {
    setNewBrand({ name: '', logo: '', description: '', isVisible: true });
    setEditingBrand(null);
    setView('list');
  };

  const handleSave = () => {
    if (editingBrand) {
      updateBrand(editingBrand._id, newBrand);
    } else {
      addBrand(newBrand);
    }
    resetForm();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="MANAGE BRANDS">
      {view === 'list' && (
        <div className="space-y-6">
          {!isManager && (
            <div className="flex gap-4">
              <GoldButton onClick={() => setView('add')} icon={Plus} className="flex-1">ADD CUSTOM BRAND</GoldButton>
              <button
                onClick={() => setView('popular')}
                className="flex-1 px-6 py-3 rounded-full border border-white/20 hover:border-yellow-500/50 text-white font-bruno transition-all hover:bg-white/5"
              >
                ADD POPULAR BRAND
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map(brand => (
              <div key={brand._id} className={cn(
                "group p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-white/5",
                brand.isActive ? "border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]" : "border-white/5 opacity-60"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <img src={brand.logo} alt={brand.name} className="h-10 w-auto object-contain" />
                  {!isManager && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingBrand(brand); setNewBrand(brand); setView('add'); }} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40">
                        <Camera size={16} />
                      </button>
                      <button onClick={() => toggleBrandVisibility(brand._id)} className="p-1.5 bg-white/10 text-yellow-400 rounded-lg hover:bg-white/20">
                        {brand.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => deleteBrand(brand._id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{brand.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{brand.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(view === 'add' || view === 'popular') && (
        <div className="space-y-6">
          {view === 'popular' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularDubaiBrands.map((brand, idx) => (
                <button key={idx} onClick={() => {
                  const existing = brands.find(b => b.name.toLowerCase() === brand.name.toLowerCase());
                  addBrand({
                    name: brand.name,
                    logo: existing?.logo || "/img/noblelogo.png",
                    description: `Premium ${brand.name} rental in Dubai.`,
                    isVisible: true
                  });
                  resetForm();
                }} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-yellow-500/50 hover:bg-white/10 transition-all text-center">
                  <span className="font-bruno text-sm">{brand.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Name</label>
                  <input
                    value={newBrand.name}
                    onChange={e => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none transition-colors"
                    placeholder="Ex: Ferrari"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logo URL</label>
                  <div className="flex gap-2">
                    <input
                      value={newBrand.logo}
                      onChange={e => setNewBrand(prev => ({ ...prev, logo: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none transition-colors"
                      placeholder="https://..."
                    />
                    <label className="p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">
                      <Upload size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        if (e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = ev => setNewBrand(prev => ({ ...prev, logo: ev.target.result }));
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={newBrand.description}
                  onChange={e => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none h-24 resize-none transition-colors"
                  placeholder="Short description for SEO..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <GoldButton onClick={handleSave} className="flex-1">{editingBrand ? 'UPDATE' : 'CREATE'} BRAND</GoldButton>
                <button onClick={resetForm} className="px-6 py-3 rounded-full text-gray-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          )}
          <button onClick={() => setView('list')} className="absolute top-6 right-16 text-sm text-gray-400 hover:text-white underline">Back to List</button>
        </div>
      )}
    </ModalWrapper>
  );
};

const AdminHeroModal = ({ isOpen, onClose, type }) => {
  const { brands, heroData, updateHeroBackground, updateHeroCarCard } = useBrand();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen) setData(type === 'background' ? heroData?.backgroundImage : heroData?.carCard);
  }, [isOpen, type, heroData]);

  const handleSave = () => {
    if (type === 'background') updateHeroBackground(data);
    else updateHeroCarCard(data);
    onClose();
  };

  if (!data) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={type === 'background' ? "MODIFY HERO BACKGROUND" : "MODIFY HERO CAR CARD"}>
      <div className="space-y-6">
        {type === 'background' ? (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10 relative group">
              <img src={data} alt="Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-bold">Preview</p>
              </div>
            </div>
            <div className="flex gap-4">
              <input
                value={data}
                onChange={e => setData(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none"
                placeholder="Image URL..."
              />
              <label className="p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-2">
                <Upload size={20} /> <span className="text-sm font-bold">Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = ev => setData(ev.target.result);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Car Title</label>
                  <input
                    value={data.title || ''}
                    onChange={e => setData({ ...data, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none"
                  />
                </div>

                {/* Brand Logo Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Logo</label>
                  <div className="space-y-3">
                    {/* Quick Select from Brands */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {brands.filter(b => b.isActive).map(b => (
                        <button
                          key={b._id}
                          onClick={() => setData({ ...data, logo: b.logo })}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all shrink-0",
                            data.logo === b.logo ? "bg-yellow-500/20 border-yellow-500 text-yellow-500" : "bg-white/5 border-white/10 hover:bg-white/10"
                          )}
                        >
                          <img src={b.logo} className="w-4 h-4 object-contain" />
                          <span className="text-xs font-bold whitespace-nowrap">{b.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Manual Input */}
                    <div className="flex gap-2">
                      <div className="bg-black/20 p-2 rounded-lg border border-white/5 shrink-0 flex items-center justify-center w-12 h-12">
                        {data.logo ? <img src={data.logo} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-white/5 rounded-full" />}
                      </div>
                      <input
                        value={data.logo || ''}
                        onChange={e => setData({ ...data, logo: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none text-xs"
                        placeholder="Logo URL..."
                      />
                      <label className="p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">
                        <Upload size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = ev => setData({ ...data, logo: ev.target.result });
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Car Image</label>
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                    <img src={data.image} className="h-24 mx-auto object-contain mb-2" />
                    <div className="flex gap-2">
                      <input
                        value={data.image || ''}
                        onChange={e => setData({ ...data, image: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                        placeholder="URL"
                      />
                      <label className="p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20">
                        <Upload size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const reader = new FileReader();
                          reader.onload = ev => setData({ ...data, image: ev.target.result });
                          if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Specs (Top 3)</label>
                {(data.specs || ['', '', '']).map((spec, idx) => (
                  <input
                    key={idx}
                    value={spec}
                    onChange={e => {
                      const newSpecs = [...(data.specs || ['', '', ''])];
                      newSpecs[idx] = e.target.value;
                      setData({ ...data, specs: newSpecs });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500/50 outline-none"
                    placeholder={`Spec ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <GoldButton onClick={handleSave} className="w-full">SAVE CHANGES</GoldButton>
      </div>
    </ModalWrapper>
  );
};

// ... Similar simplified modals for Logo and Gallery using ModalWrapper and consistent styling ...
// (Omitting full code for Logo/Gallery fetch similar details to minimize verbosity, but sticking to the style)

const AdminLogoModal = ({ isOpen, onClose }) => {
  const { logoData, updateLogo } = useBrand();
  const [data, setData] = useState(null);

  useEffect(() => { if (isOpen) setData(logoData || {}); }, [isOpen, logoData]);

  const handleSave = () => { updateLogo(data); onClose(); };

  if (!data) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="MODIFY LOGO" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 mb-6">
          <img src={data.navbarLogo || "/img/noblelogo.png"} className="h-16 object-contain mb-4" alt="Logo" />
          <label className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full cursor-pointer transition-colors text-sm flex items-center gap-2">
            <Upload size={16} /> Change Logo File
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const reader = new FileReader();
              reader.onload = ev => setData({ ...data, navbarLogo: ev.target.result });
              if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
            }} />
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
          <input
            value={data.companyName || ''}
            onChange={e => setData({ ...data, companyName: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bruno focus:border-yellow-500/50 outline-none text-xl"
            placeholder="NOBLE LUX RENT"
          />
        </div>
        <GoldButton onClick={handleSave} className="w-full">UPDATE BRANDING</GoldButton>
      </div>
    </ModalWrapper>
  );
};

const AdminGalleryModal = ({ isOpen, onClose }) => {
  const { galleryData, updateGallery } = useBrand();
  const [data, setData] = useState({ desktopPhotos: [], mobilePhotos: [] });

  useEffect(() => { if (isOpen && galleryData) setData(galleryData); }, [isOpen, galleryData]);

  const handlePhotoChange = (section, index, key, value) => {
    const newData = { ...data };
    newData[section][index] = { ...newData[section][index], [key]: value };
    setData(newData);
  };

  // Helper to upload photo
  const uploadPhoto = (section, index, file) => {
    const reader = new FileReader();
    reader.onload = ev => handlePhotoChange(section, index, 'imageUrl', ev.target.result);
    if (file) reader.readAsDataURL(file);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="MANAGE GALLERY" maxWidth="max-w-6xl">
      <div className="space-y-8">
        {['desktopPhotos', 'mobilePhotos'].map(section => (
          <div key={section}>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent mb-4 font-bruno capitalize">
              {section.replace('Photos', '')} Showcase
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} className="bg-white/5 p-3 rounded-2xl border border-white/5 group hover:border-yellow-500/30 transition-colors">
                  <div className="aspect-square bg-black/50 rounded-xl mb-3 relative overflow-hidden">
                    <img src={data[section]?.[idx]?.imageUrl || '/img/placeholder.png'} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="text-yellow-400" />
                      <input type="file" className="hidden" onChange={e => uploadPhoto(section, idx, e.target.files[0])} accept="image/*" />
                    </label>
                  </div>
                  <input
                    value={data[section]?.[idx]?.alt || ''}
                    onChange={e => handlePhotoChange(section, idx, 'alt', e.target.value)}
                    className="w-full bg-black/20 border-none rounded-lg text-xs p-2 text-white/70 focus:text-white focus:bg-white/10 outline-none"
                    placeholder="Description..."
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <GoldButton onClick={() => { updateGallery(data); onClose(); }} className="w-full">SAVE ALL CHANGES</GoldButton>
      </div>
    </ModalWrapper>
  );
};


// --- Main Page Component ---
const AdminManageHome = () => {
  const { brands, heroData, logoData, selectedBrand, setSelectedBrand, loading, getVisibleBrands } = useBrand();
  const user = useAdminUser();
  const isManager = user?.role === 'manager';

  const [modals, setModals] = useState({ brand: false, hero: false, logo: false, gallery: false, heroType: '' });
  const toggleModal = (key, val = true, type = '') => setModals(prev => ({ ...prev, [key]: val, heroType: type }));

  if (loading) return (
    <div className="flex bg-black min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 p-8 lg:ml-80">
        <SkeletonLoader />
      </main>
    </div>
  );

  const visibleBrands = getVisibleBrands();
  const activeBrand = brands.find(b => b.name === selectedBrand) || visibleBrands[0];

  return (
    <div className="flex bg-black min-h-screen text-white font-sans selection:bg-yellow-500/30">
      {/* Background Ambient Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <Sidebar />

      <main className="flex-1 relative z-10 lg:ml-80 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-bruno bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
              HOME PAGE
            </h1>
            <p className="text-gray-400">Manage your digital storefront with precision.</p>
          </div>
          {!isManager && (
            <div className="flex gap-3 mt-4 md:mt-0">
              <button onClick={() => toggleModal('brand')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> CUSTOM BRAND
              </button>
            </div>
          )}
        </header>

        {/* Hero & Logo Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Hero Display - Fixed Overlap */}
          <GlassContainer hoverEffect className="relative flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bruno text-white mb-1">HERO DISPLAY</h2>
                <p className="text-sm text-gray-400">Main visual and featured car</p>
              </div>
              {!isManager && <button onClick={() => toggleModal('hero', true, 'background')} className="p-2 bg-white/5 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors"><Camera size={20} /></button>}
            </div>

            {/* Background Image Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 group bg-black/50">
              {heroData?.backgroundImage ? (
                <img src={heroData.backgroundImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Hero BG" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No Hero Background</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Car Card Preview - Redesigned for Premium Look */}
            <div className="mt-auto bg-[#050505] backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-yellow-500/50 transition-all duration-500 group/card relative overflow-hidden shadow-2xl">
              {/* Gold Glow Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6 items-center">
                {/* Brand Logo */}
                <div className="h-16 w-16 md:h-20 md:w-20 bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center justify-center shrink-0">
                  {heroData?.carCard?.logo ? <img src={heroData.carCard.logo} className="w-full h-full object-contain filter drop-shadow-lg" /> : <span className="text-xs text-gray-500">Logo</span>}
                </div>

                {/* Title & Specs */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h3 className="font-bruno text-2xl md:text-3xl text-white group-hover/card:text-yellow-400 transition-colors tracking-wide leading-tight mb-3">
                    {heroData?.carCard?.title || "Car Model Name"}
                  </h3>

                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar justify-center md:justify-start gap-2 pb-1">
                    {heroData?.carCard?.specs?.length > 0 ? (
                      heroData.carCard.specs.slice(0, 3).map((s, i) => (
                        <div key={i} className="bg-white/5 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 shrink-0 group/spec hover:bg-white/10 transition-colors backdrop-blur-sm">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                          <span className="text-xs font-bold text-gray-200 uppercase tracking-wider whitespace-nowrap">{s}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No specs defined</span>
                    )}
                  </div>
                </div>

                {/* Car Image - Optimized for Preview */}
                {heroData?.carCard?.image && (
                  <div className="w-full h-32 flex items-center justify-center relative shrink-0 mt-2">
                    <img
                      src={heroData.carCard.image}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform group-hover/card:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
              </div>
            </div>

            {!isManager && <GoldButton onClick={() => toggleModal('hero', true, 'carcard')} className="w-full mt-6">EDIT FEATURED CAR</GoldButton>}
          </GlassContainer>

          <div className="flex flex-col gap-8 h-full">
            {/* Logo Branding */}
            <GlassContainer hoverEffect className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="mb-4">
                <img src={logoData?.navbarLogo || "/img/noblelogo.png"} className="h-24 object-contain mx-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" />
                <h2 className="text-2xl font-bruno mt-6 tracking-widest text-white">{logoData?.companyName || "NOBLE LUX RENT"}</h2>
              </div>
              {!isManager && <button onClick={() => toggleModal('logo')} className="mt-4 text-xs text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-widest border-b border-yellow-500/50 hover:border-yellow-400 pb-1">Modify Branding</button>}
            </GlassContainer>

            {/* Gallery Quick Access */}
            <GlassContainer hoverEffect className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bruno text-white">GALLERY</h2>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <ImageIcon className="text-yellow-500" size={24} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"><ImageIcon size={16} className="text-gray-700" /></div>)}
              </div>
              {!isManager && <GoldButton onClick={() => toggleModal('gallery')} className="w-full">MANAGE GALLERY</GoldButton>}
            </GlassContainer>
          </div>
        </div>

        {/* Brands Section - Fixed Colors & Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bruno text-white">ACTIVE BRANDS</h2>
            <button onClick={() => toggleModal('brand')} className="text-sm text-gray-400 hover:text-white transition-colors underline decoration-yellow-500/50">View All Brands</button>
          </div>

          {/* Centered Grid with Flexbox for Better Alignment */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {visibleBrands.map(brand => (
              <motion.button
                key={brand._id}
                onClick={() => setSelectedBrand(brand.name)}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl p-4 flex items-center justify-center transition-all duration-300 border backdrop-blur-sm relative overflow-hidden group",
                  selectedBrand === brand.name
                    ? "bg-black border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                    : "bg-[#050505] border-white/5 hover:border-yellow-500/50 hover:bg-[#0a0a0a]"
                )}
              >
                {/* Subtle internal glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:to-yellow-500/5 transition-all duration-500" />
                <img src={brand.logo} className="w-full h-full object-contain p-2 relative z-10 filter drop-shadow-md" alt={brand.name} loading="lazy" />
              </motion.button>
            ))}
          </div>

          {/* Active Brand Detail - Darker Theme */}
          <AnimatePresence mode="wait">
            {activeBrand && (
              <motion.div
                key={activeBrand.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#050505] border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-40 bg-yellow-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-40 bg-purple-900/5 blur-[120px] rounded-full pointer-events-none" />

                <img src={activeBrand.logo} className="h-28 mx-auto mb-8 object-contain relative z-10 drop-shadow-2xl" />
                <h3 className="text-3xl font-bold font-bruno mb-6 text-white">{activeBrand.name}</h3>
                <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed text-lg font-light tracking-wide">{activeBrand.description}</p>
                {!isManager && (
                  <div className="mt-10 flex justify-center gap-4">
                    <button onClick={() => toggleModal('brand')} className="px-10 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-yellow-400 hover:border-yellow-500/50 transition-all font-bold tracking-widest text-sm uppercase">
                      Edit Details
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* Modals */}
      <AdminBrandModal isOpen={modals.brand} onClose={() => toggleModal('brand', false)} />
      <AdminHeroModal isOpen={modals.hero} onClose={() => toggleModal('hero', false)} type={modals.heroType} />
      <AdminLogoModal isOpen={modals.logo} onClose={() => toggleModal('logo', false)} />
      <AdminGalleryModal isOpen={modals.gallery} onClose={() => toggleModal('gallery', false)} />
    </div>
  );
};

const AdminManageHomeWithProvider = () => {
  return (
    <>
      <style jsx global>{`
                .sidebar-container { position: sticky; top: 0; height: 100vh; overflow-y: auto; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234,179,8,0.5); }
            `}</style>
      <BrandProvider>
        <AdminManageHome />
      </BrandProvider>
    </>
  );
};

export default AdminManageHomeWithProvider;