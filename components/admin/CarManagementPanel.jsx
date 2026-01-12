"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { X, ChevronRight, Car, Activity, Disc, Zap, Check, Plus, Upload, Image as ImageIcon, Trash2, Fuel, Gauge, Armchair, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// --- MEMOIZED HELPERS ---

// Helper: Category Card
const CategoryButton = memo(({ label, icon, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`relative group overflow-hidden p-5 rounded-xl border transition-all duration-300 w-full flex flex-col items-center justify-center gap-3 ${isSelected
            ? "bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.15)]"
            : "bg-black/40 border-white/10 hover:border-[#FFD700]/40 hover:bg-white/5"
            }`}
    >
        <div className={`p-3 rounded-lg transition-all duration-300 transform group-hover:scale-110 ${isSelected ? "bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]" : "bg-black/60 text-gray-500 group-hover:text-[#FFD700]"
            }`}>
            {icon}
        </div>
        <span className={`font-bruno uppercase tracking-wider text-[11px] ${isSelected ? "text-[#FFD700]" : "text-gray-400 group-hover:text-white"
            }`}>
            {label}
        </span>
    </button>
));
CategoryButton.displayName = "CategoryButton";

// Helper: Image Preview
const ImagePreview = memo(({ src, onRemove, isMain, onSetMain }) => (
    <div className={`relative group rounded-xl overflow-hidden aspect-square bg-[#0F0F0F] border transition-all duration-500 ${isMain ? "border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.2)] ring-2 ring-[#FFD700]/30" : "border-white/10 hover:border-[#FFD700]/50"
        }`}>
        <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Car" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
            <button
                onClick={onRemove}
                className="p-2.5 bg-red-500/90 hover:bg-red-600 rounded-lg text-white transition-all hover:scale-110 shadow-xl"
            >
                <Trash2 size={18} />
            </button>
            {!isMain && onSetMain && (
                <button
                    onClick={onSetMain}
                    className="px-4 py-2 bg-[#FFD700] text-black font-bruno text-[11px] rounded-lg hover:bg-white transition-all uppercase tracking-widest shadow-xl hover:scale-105"
                >
                    Set as Main
                </button>
            )}
        </div>
        {isMain && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black text-[10px] font-bold px-3 py-1.5 rounded-lg font-bruno uppercase tracking-widest shadow-lg">
                Primary
            </div>
        )}
    </div>
));
ImagePreview.displayName = "ImagePreview";

// Helper: Premium Input
const PremiumInput = memo(({ label, value, onChange, placeholder, type = "text", icon: Icon, className, fullHeight, required }) => (
    <div className={`flex flex-col gap-2.5 ${className}`}>
        {label && (
            <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em] pl-1 flex items-center gap-2">
                {label}
                {required && <span className="text-[#FFD700] text-xs">*</span>}
            </label>
        )}
        <div className="relative group flex-1">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-black/60 text-white placeholder-gray-600 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-[#FFD700]/70 focus:bg-black/80 focus:shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all duration-300 text-[15px] ${fullHeight ? 'h-full' : ''}`}
            />
            {Icon && <Icon size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FFD700] transition-colors" />}
        </div>
    </div>
));
PremiumInput.displayName = "PremiumInput";

// Helper: Section Header
const SectionHeader = memo(({ title, subtitle, icon: Icon }) => (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
        {Icon && (
            <div className="p-3 bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 rounded-xl border border-[#FFD700]/30">
                <Icon size={20} className="text-[#FFD700]" />
            </div>
        )}
        <div>
            <h3 className="text-white font-bruno text-base uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
    </div>
));
SectionHeader.displayName = "SectionHeader";


// --- MEMOIZED SECTIONS ---

// 1. Identity Section
const IdentitySection = memo(({
    year, model, title, logo, brand, categories,
    brands, showBrandSelection, setShowBrandSelection,
    onBrandSelect, onChange, onCategoryChange
}) => {
    return (
        <div className="bg-gradient-to-br from-[#0F0F0F] to-black rounded-3xl p-10 border border-white/10 shadow-2xl">
            <SectionHeader title="Vehicle Identity" subtitle="Core Information" icon={Car} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Brand Selection */}
                <div className="lg:col-span-2">
                    <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em] pl-1 mb-3 block flex items-center gap-2">
                        Brand & Manufacturer <span className="text-[#FFD700] text-xs">*</span>
                    </label>
                    <Dialog open={showBrandSelection} onOpenChange={setShowBrandSelection}>
                        <DialogTrigger asChild>
                            <button className="w-full flex items-center justify-between bg-black/60 border border-white/10 px-6 py-5 rounded-xl hover:border-[#FFD700]/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    {logo ? <img src={logo} className="w-10 h-10 object-contain" alt="brand" /> : <Car size={24} className="text-gray-500" />}
                                    <span className={`text-base font-bold tracking-wide ${brand ? 'text-white' : 'text-gray-500'}`}>{brand || "SELECT BRAND"}</span>
                                </div>
                                <ChevronRight size={20} className="text-gray-600 group-hover:text-[#FFD700] transition-colors" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0F0F0F] text-white border-white/10 max-w-4xl">
                            <DialogHeader><DialogTitle className="font-bruno text-[#FFD700] text-2xl">Select Manufacturer</DialogTitle></DialogHeader>
                            <div className="grid grid-cols-4 gap-4 mt-6 max-h-[500px] overflow-y-auto pr-2">
                                {brands.map((b) => (
                                    <button key={b._id} onClick={() => onBrandSelect(b)} className="p-6 bg-black/60 border border-white/10 hover:border-[#FFD700] hover:bg-[#FFD700]/5 rounded-xl flex flex-col items-center gap-3 transition-all group">
                                        <img src={b.logo} className="w-14 h-14 object-contain grayscale group-hover:grayscale-0 transition-all" alt={b.name} />
                                        <span className="text-[11px] uppercase font-bold text-gray-400 group-hover:text-white">{b.name}</span>
                                    </button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Year */}
                <PremiumInput label="Model Year" value={year} onChange={(e) => onChange("year", e.target.value)} placeholder="2025" required />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <PremiumInput label="Model Code" value={model} onChange={(e) => onChange("model", e.target.value)} placeholder="Huracan Evo" required />
                <PremiumInput label="Display Title" value={title} onChange={(e) => onChange("title", e.target.value)} placeholder="Lamborghini Huracan Evo Spyder" />
            </div>

            {/* Categories */}
            <div className="mt-10">
                <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em] pl-1 mb-5 block">
                    Vehicle Categories
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <CategoryButton label="Supercar" icon={<Zap size={18} />} isSelected={categories.supercar} onClick={() => onCategoryChange("supercar")} />
                    <CategoryButton label="Luxury" icon={<Disc size={18} />} isSelected={categories.luxury} onClick={() => onCategoryChange("luxury")} />
                    <CategoryButton label="Sports" icon={<Activity size={18} />} isSelected={categories.sports} onClick={() => onCategoryChange("sports")} />
                    <CategoryButton label="Convertible" icon={<Car size={18} />} isSelected={categories.convertible} onClick={() => onCategoryChange("convertible")} />
                </div>
            </div>
        </div>
    );
});
IdentitySection.displayName = "IdentitySection";

// 2. Visuals Section
const VisualsSection = memo(({
    mainImage, galleryImages, galleryVideos,
    onMainImageUpload, onGalleryUpload, onSetMain, onRemoveMedia
}) => {
    const mainInputRef = useRef(null);
    const galleryImgRef = useRef(null);
    const galleryVidRef = useRef(null);

    return (
        <div className="bg-gradient-to-br from-[#0F0F0F] to-black rounded-3xl p-10 border border-white/10 shadow-2xl">
            <SectionHeader title="Visual Assets" subtitle="Photography & Media" icon={ImageIcon} />

            {/* Main Cover Image */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em]">Primary Cover Image</label>
                    <span className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFD700]/10 text-[#FFD700] px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border border-[#FFD700]/30">HERO IMAGE</span>
                </div>

                <div
                    className="group relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl cursor-pointer"
                    onClick={() => mainInputRef.current.click()}
                >
                    <img
                        src={mainImage || '/img/default-car.jpg'}
                        alt="Main"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black px-8 py-4 rounded-xl font-bruno text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(255,215,0,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Upload size={20} /> UPLOAD COVER IMAGE
                        </div>
                    </div>
                    <input ref={mainInputRef} type="file" onChange={onMainImageUpload} className="hidden" accept="image/*" />
                </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-gray-400 font-bruno text-[11px] uppercase tracking-[0.15em]">Gallery Collection</h4>
                    <div className="flex gap-3">
                        <button onClick={() => galleryImgRef.current.click()} className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:border-[#FFD700]/50 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FDB931] hover:text-black rounded-xl transition-all text-xs font-bold uppercase tracking-wider">
                            <ImageIcon size={16} /> Add Photos
                        </button>
                        <button onClick={() => galleryVidRef.current.click()} className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:border-[#FFD700]/50 hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FDB931] hover:text-black rounded-xl transition-all text-xs font-bold uppercase tracking-wider">
                            <Zap size={16} /> Add Videos
                        </button>
                        <input ref={galleryImgRef} type="file" multiple onChange={(e) => onGalleryUpload(e, 'galleryImages')} className="hidden" accept="image/*" />
                        <input ref={galleryVidRef} type="file" multiple onChange={(e) => onGalleryUpload(e, 'galleryVideos')} className="hidden" accept="video/*" />
                    </div>
                </div>

                {galleryImages.length > 0 || galleryVideos.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {galleryImages.map((img, idx) => (
                            <ImagePreview key={idx} src={img} onRemove={() => onRemoveMedia('galleryImages', idx)} isMain={false} onSetMain={() => onSetMain(img, idx)} />
                        ))}
                        {galleryVideos.map((vid, idx) => (
                            <div key={`vid-${idx}`} className="relative group rounded-xl overflow-hidden aspect-square bg-black/60 border border-white/10 hover:border-[#FFD700]/50 transition-all">
                                <video src={vid} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onRemoveMedia('galleryVideos', idx)} className="p-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all"><Trash2 size={16} /></button>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[9px] text-[#FFD700] font-bold uppercase tracking-wider">VIDEO</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                        <div className="p-5 bg-white/5 rounded-2xl mb-4 text-gray-600"><ImageIcon size={32} /></div>
                        <span className="text-gray-500 text-xs font-bruno uppercase tracking-widest">No Gallery Media</span>
                        <span className="text-gray-600 text-[10px] mt-1">Click buttons above to add</span>
                    </div>
                )}
            </div>
        </div>
    );
});
VisualsSection.displayName = "VisualsSection";

// 3. Performance Section
const PerformanceSection = memo(({
    specs, topSpeed, transmission, seats, drive, fuelType,
    onSpecChange, onChange, onFuelChange
}) => {
    return (
        <div className="bg-gradient-to-br from-[#0F0F0F] to-black rounded-3xl p-10 border border-white/10 shadow-2xl">
            <SectionHeader title="Performance Specs" subtitle="Technical Details" icon={Gauge} />

            {/* Key Specs Display */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                {specs.map((spec, idx) => (
                    <div key={idx} className="bg-black/60 p-5 rounded-xl border border-white/10 flex flex-col gap-3 hover:border-[#FFD700]/30 transition-all">
                        <input
                            value={spec.label}
                            onChange={(e) => onSpecChange(idx, 'label', e.target.value)}
                            className="bg-transparent text-white font-bold text-xl text-center focus:outline-none placeholder-gray-700 w-full"
                            placeholder="V10"
                        />
                        <div className="h-[1px] w-full bg-white/10" />
                        <input
                            value={spec.icon}
                            onChange={(e) => onSpecChange(idx, 'icon', e.target.value)}
                            className="bg-transparent text-[9px] text-gray-500 text-center focus:outline-none w-full font-mono"
                            placeholder="Icon path"
                        />
                    </div>
                ))}
            </div>

            {/* Detailed Specs */}
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <PremiumInput icon={Gauge} label="0-100 KM/H" value={topSpeed} onChange={(e) => onChange("topSpeed", e.target.value)} placeholder="2.9s" />
                    <PremiumInput icon={Activity} label="Transmission" value={transmission} onChange={(e) => onChange("transmission", e.target.value)} placeholder="Automatic" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <PremiumInput icon={Armchair} label="Seating" value={seats} onChange={(e) => onChange("seats", e.target.value)} placeholder="2 Seats" />
                    <PremiumInput icon={Car} label="Drivetrain" value={drive} onChange={(e) => onChange("drive", e.target.value)} placeholder="AWD" />
                </div>
            </div>

            {/* Fuel Type Selector */}
            <div className="mt-8">
                <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em] pl-1 mb-4 block">Fuel Type</label>
                <div className="grid grid-cols-4 gap-3 bg-black/40 p-2 rounded-xl border border-white/10">
                    {["Petrol", "Hybrid", "Diesel", "Electric"].map((type) => (
                        <button
                            key={type}
                            onClick={() => onFuelChange(type)}
                            className={`py-4 text-[11px] font-bold uppercase rounded-lg transition-all ${fuelType === type ? "bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});
PerformanceSection.displayName = "PerformanceSection";

// 4. Financial Section
const FinancialSection = memo(({
    pricing, state, onPricingChange, onStateChange
}) => {
    return (
        <div className="bg-gradient-to-br from-[#0F0F0F] to-black rounded-3xl p-10 border border-white/10 shadow-2xl">
            <SectionHeader title="Pricing & Availability" subtitle="Financial Management" icon={AlertCircle} />

            {/* Daily Rate */}
            <div className="flex bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-2xl border border-[#FFD700]/30 p-6 items-center justify-between shadow-[inset_0_0_30px_rgba(0,0,0,0.3)] mb-6">
                <span className="text-[#FFD700] font-bruno text-sm uppercase tracking-wider">Daily Rate</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-lg">$</span>
                    <input
                        value={pricing.daily}
                        onChange={(e) => onPricingChange("daily", e.target.value)}
                        className="bg-transparent text-right text-4xl font-bold text-white focus:outline-none w-40 placeholder-gray-800"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Weekly & Monthly */}
            <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="bg-black/60 rounded-xl border border-white/10 p-5">
                    <span className="text-gray-500 text-[10px] uppercase font-bruno block mb-3 tracking-wider">Weekly</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-600 text-sm">$</span>
                        <input
                            value={pricing.weekly}
                            onChange={(e) => onPricingChange("weekly", e.target.value)}
                            className="bg-transparent text-2xl font-bold text-gray-200 focus:outline-none w-full"
                            placeholder="0"
                        />
                    </div>
                </div>
                <div className="bg-black/60 rounded-xl border border-white/10 p-5">
                    <span className="text-gray-500 text-[10px] uppercase font-bruno block mb-3 tracking-wider">Monthly</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-600 text-sm">$</span>
                        <input
                            value={pricing.monthly}
                            onChange={(e) => onPricingChange("monthly", e.target.value)}
                            className="bg-transparent text-2xl font-bold text-gray-200 focus:outline-none w-full"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Availability */}
            <div>
                <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em] pl-1 mb-4 block">Fleet Status</label>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onStateChange("Available")} className={`py-6 rounded-xl border transition-all flex items-center justify-center gap-3 ${state === "Available" ? "bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500 text-green-400" : "bg-black/60 border-white/10 text-gray-600"}`}>
                        <div className={`w-3 h-3 rounded-full ${state === "Available" ? "bg-green-500 shadow-[0_0_15px_#00ff00]" : "bg-gray-600"}`} />
                        <span className="font-bruno text-sm uppercase">Available</span>
                    </button>
                    <button onClick={() => onStateChange("Unavailable")} className={`py-6 rounded-xl border transition-all flex items-center justify-center gap-3 ${state !== "Available" ? "bg-gradient-to-r from-red-500/20 to-red-500/10 border-red-500 text-red-400" : "bg-black/60 border-white/10 text-gray-600"}`}>
                        <div className={`w-3 h-3 rounded-full ${state !== "Available" ? "bg-red-500 shadow-[0_0_15px_#ff0000]" : "bg-gray-600"}`} />
                        <span className="font-bruno text-sm uppercase">Unavailable</span>
                    </button>
                </div>
            </div>
        </div>
    );
});
FinancialSection.displayName = "FinancialSection";

// 5. Content Section (Description, Features, Requirements)
const ContentSection = memo(({
    description, features, rentalRequirements,
    onChange, onListAdd, onListChange, onListRemove
}) => {
    return (
        <div className="bg-gradient-to-br from-[#0F0F0F] to-black rounded-3xl p-10 border border-white/10 shadow-2xl">
            <SectionHeader title="Description & Features" subtitle="Client-Facing Content" icon={Activity} />

            {/* Description */}
            <div className="mb-10">
                <label className="text-gray-400 text-[11px] uppercase font-bruno tracking-[0.15em] pl-1 mb-3 block">Vehicle Story</label>
                <textarea
                    value={description}
                    onChange={(e) => onChange("description", e.target.value)}
                    rows="6"
                    className="w-full bg-black/60 text-gray-300 border border-white/10 rounded-xl p-6 focus:outline-none focus:border-[#FFD700]/50 transition-colors leading-relaxed placeholder-gray-700 resize-none text-[15px]"
                    placeholder="Describe the experience, heritage, and unique characteristics of this vehicle..."
                />
            </div>

            {/* Features & Requirements Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Features List */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-gray-400 font-bruno text-[11px] uppercase tracking-[0.15em]">Key Features</h4>
                        <button onClick={() => onListAdd("features")} className="text-[#FFD700] hover:text-white hover:bg-[#FFD700]/10 transition-all p-2 rounded-lg"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {features.map((feat, idx) => (
                            <div key={idx} className="group flex items-center gap-3 bg-black/40 rounded-lg p-3 border border-white/5 hover:border-[#FFD700]/30 transition-all">
                                <span className="text-[#FFD700] text-sm">•</span>
                                <input
                                    value={feat}
                                    onChange={(e) => onListChange("features", idx, e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-gray-300 focus:text-white outline-none transition-colors placeholder-gray-600"
                                    placeholder="Add feature..."
                                />
                                <button onClick={() => onListRemove("features", idx)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all p-1"><X size={16} /></button>
                            </div>
                        ))}
                        {features.length === 0 && (
                            <div className="text-center py-8">
                                <span className="text-gray-600 text-xs italic">No features listed</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Requirements List */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-gray-400 font-bruno text-[11px] uppercase tracking-[0.15em]">Rental Requirements</h4>
                        <button onClick={() => onListAdd("rentalRequirements")} className="text-[#FFD700] hover:text-white hover:bg-[#FFD700]/10 transition-all p-2 rounded-lg"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {rentalRequirements.map((req, idx) => (
                            <div key={idx} className="group flex items-center gap-3 bg-black/40 rounded-lg p-3 border border-white/5 hover:border-[#FFD700]/30 transition-all">
                                <span className="text-[#FFD700] text-sm">•</span>
                                <input
                                    value={req}
                                    onChange={(e) => onListChange("rentalRequirements", idx, e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-gray-300 focus:text-white outline-none transition-colors placeholder-gray-600"
                                    placeholder="Add requirement..."
                                />
                                <button onClick={() => onListRemove("rentalRequirements", idx)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all p-1"><X size={16} /></button>
                            </div>
                        ))}
                        {rentalRequirements.length === 0 && (
                            <div className="text-center py-8">
                                <span className="text-gray-600 text-xs italic">No requirements listed</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
ContentSection.displayName = "ContentSection";


// --- MAIN COMPONENT ---

export default function CarManagementPanel({ existingCar = null, onClose, onSave }) {
    // State Initialization
    const [car, setCar] = useState(
        existingCar || {
            id: existingCar?.id || "",
            brand: "",
            model: "",
            title: "",
            mainImage: "/img/default-car.jpg",
            galleryImages: [],
            galleryVideos: [],
            logo: "/img/default-logo.png",
            categories: { supercar: false, luxury: false, sports: false, convertible: false },
            specs: [
                { icon: "/img/car-engine.png", label: "V10" },
                { icon: "/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png", label: "640" },
                { icon: "/img/fuel-station.png", label: "5.2L" },
            ],
            transmission: "",
            topSpeed: "",
            seats: "",
            drive: "",
            pricing: { daily: "2500", weekly: "15000", monthly: "70000" },
            description: "",
            features: [],
            rentalRequirements: [],
            faqs: [],
            mileage: { limit: "300", additionalCharge: "10" },
            state: "Available",
            fuelType: "Petrol",
            year: new Date().getFullYear().toString()
        }
    );

    const [brands, setBrands] = useState([]);
    const [showBrandSelection, setShowBrandSelection] = useState(false);

    // Fetch Brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch('/api/brands');
                if (response.ok) setBrands(await response.json());
            } catch (error) { console.error("Error fetching brands:", error); }
        };
        fetchBrands();
    }, []);

    // --- STABLE HANDLERS ---
    const handleChange = useCallback((field, value) => {
        setCar(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNestedChange = useCallback((parent, field, value) => {
        setCar(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
    }, []);

    const handleSpecChange = useCallback((index, field, value) => {
        setCar(prev => {
            const newSpecs = [...prev.specs];
            newSpecs[index] = { ...newSpecs[index], [field]: value };
            return { ...prev, specs: newSpecs };
        });
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setCar(prev => ({
            ...prev,
            categories: { ...prev.categories, [category]: !prev.categories[category] }
        }));
    }, []);

    const handleBrandSelect = useCallback((brandData) => {
        setCar(prev => ({
            ...prev,
            brand: brandData.name,
            logo: brandData.logo || "/img/default-logo.png"
        }));
        setShowBrandSelection(false);
    }, []);

    const handleFuelChange = useCallback((type) => {
        setCar(prev => ({ ...prev, fuelType: type }));
    }, []);

    const handleStateChange = useCallback((newState) => {
        setCar(prev => ({ ...prev, state: newState }));
    }, []);

    const handleListAdd = useCallback((listName) => {
        setCar(prev => ({ ...prev, [listName]: [...prev[listName], ""] }));
    }, []);

    const handleListChange = useCallback((listName, index, value) => {
        setCar(prev => {
            const newList = [...prev[listName]];
            newList[index] = value;
            return { ...prev, [listName]: newList };
        });
    }, []);

    const handleListRemove = useCallback((listName, index) => {
        setCar(prev => {
            const newList = [...prev[listName]];
            newList.splice(index, 1);
            return { ...prev, [listName]: newList };
        });
    }, []);

    // Image Helper
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    const handleMainImageUpload = useCallback(async (e) => {
        if (e.target.files[0]) {
            const compressed = await compressImage(e.target.files[0]);
            setCar(prev => ({ ...prev, mainImage: compressed }));
        }
    }, []);

    const handleGalleryUpload = useCallback(async (e, type) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const newMedia = await Promise.all(files.map(f => compressImage(f)));
        setCar(prev => ({ ...prev, [type]: [...prev[type], ...newMedia] }));
    }, []);

    const handleSetMain = useCallback((img, idx) => {
        setCar(prev => {
            const newGallery = prev.galleryImages.filter((_, i) => i !== idx);
            if (prev.mainImage !== '/img/default-car.jpg') newGallery.push(prev.mainImage);
            return { ...prev, mainImage: img, galleryImages: newGallery };
        });
    }, []);

    const handleRemoveMedia = useCallback((type, idx) => {
        setCar(prev => {
            const newMedia = [...prev[type]];
            newMedia.splice(idx, 1);
            return { ...prev, [type]: newMedia };
        });
    }, []);

    const handleSave = () => {
        if (!car.brand || !car.model) {
            alert("Please provide at least a Brand and Model.");
            return;
        }
        if (onSave) onSave(car);
    };

    // Render
    return (
        <div className="bg-black text-white h-full flex flex-col w-full relative overflow-hidden">

            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#FFD700]/3 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-[#FFD700]/3 rounded-full blur-[150px] pointer-events-none" />

            {/* Sticky Header */}
            <div className="flex justify-between items-center px-12 py-8 border-b border-white/10 bg-black/80 backdrop-blur-2xl z-30 sticky top-0">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 rounded-2xl border border-[#FFD700]/30">
                        <Car size={28} className="text-[#FFD700]" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-bruno text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] tracking-tight">
                            {existingCar ? "MODIFY VEHICLE" : "ADD NEW VEHICLE"}
                        </h2>
                        <p className="text-gray-500 text-[11px] font-bruno tracking-[0.2em] uppercase mt-2">
                            Fleet Management • Noble Luxury
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="group p-4 rounded-xl border border-white/10 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all duration-300"
                >
                    <X size={22} className="text-gray-400 group-hover:text-[#FFD700] transition-colors" />
                </button>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-12 py-10" style={{ willChange: 'transform' }}>
                <div className="max-w-[1800px] mx-auto space-y-10">

                    <IdentitySection
                        year={car.year}
                        model={car.model}
                        title={car.title}
                        logo={car.logo}
                        brand={car.brand}
                        categories={car.categories}
                        brands={brands}
                        showBrandSelection={showBrandSelection}
                        setShowBrandSelection={setShowBrandSelection}
                        onBrandSelect={handleBrandSelect}
                        onChange={handleChange}
                        onCategoryChange={handleCategoryChange}
                    />

                    <VisualsSection
                        mainImage={car.mainImage}
                        galleryImages={car.galleryImages}
                        galleryVideos={car.galleryVideos}
                        onMainImageUpload={handleMainImageUpload}
                        onGalleryUpload={handleGalleryUpload}
                        onSetMain={handleSetMain}
                        onRemoveMedia={handleRemoveMedia}
                    />

                    <PerformanceSection
                        specs={car.specs}
                        topSpeed={car.topSpeed}
                        transmission={car.transmission}
                        seats={car.seats}
                        drive={car.drive}
                        fuelType={car.fuelType}
                        onSpecChange={handleSpecChange}
                        onChange={handleChange}
                        onFuelChange={handleFuelChange}
                    />

                    <FinancialSection
                        pricing={car.pricing}
                        state={car.state}
                        onPricingChange={handleNestedChange}
                        onStateChange={handleStateChange}
                    />

                    <ContentSection
                        description={car.description}
                        features={car.features}
                        rentalRequirements={car.rentalRequirements}
                        onChange={handleChange}
                        onListAdd={handleListAdd}
                        onListChange={handleListChange}
                        onListRemove={handleListRemove}
                    />

                </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="px-12 py-6 border-t border-white/10 bg-black/80 backdrop-blur-2xl z-30 flex justify-between items-center sticky bottom-0">
                <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <AlertCircle size={16} />
                    <span>All required fields must be filled</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-8 py-4 rounded-xl text-white font-bruno font-bold hover:bg-white/5 border border-white/10 transition-all uppercase text-xs tracking-widest">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-12 py-4 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black font-bruno font-bold text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,215,0,0.4)] uppercase tracking-widest"
                    >
                        {existingCar ? "Update Vehicle" : "Add to Fleet"}
                    </button>
                </div>
            </div>

        </div>
    );
}