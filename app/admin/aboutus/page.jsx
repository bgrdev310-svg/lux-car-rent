
"use client";
import React, { useState, useEffect, useCallback, memo } from 'react';
import Sidebar from "@/components/ui/sidebar";
import { useAdminUser } from '../AdminUserProvider';
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, Layout, Image as ImageIcon, MapPin, Eye, Loader2, X, Check, Star, Crown, Zap, Shield, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Luxury UI Components (Memoized) ---

const GlassContainer = memo(({ children, className, hoverEffect = false }) => (
    <div className={cn(
        "bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group/glass will-change-transform",
        hoverEffect && "hover:border-yellow-500/20 hover:shadow-[0_0_40px_rgba(234,179,8,0.1)] transition-all duration-500",
        className
    )}>
        {/* Internal Glow - Static to save GPU */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10">{children}</div>
    </div>
));
GlassContainer.displayName = 'GlassContainer';

const SectionTitle = memo(({ title, subtitle, icon: Icon }) => (
    <div className="mb-8 flex items-start gap-4">
        {Icon && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border border-yellow-500/20 text-yellow-500">
                <Icon size={24} />
            </div>
        )}
        <div>
            <h3 className="text-2xl font-bruno text-white tracking-wide">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400 font-light mt-1 tracking-wide">{subtitle}</p>}
        </div>
    </div>
));
SectionTitle.displayName = 'SectionTitle';

// Optimized Input with Local State (Debounce via onBlur)
const FloatingInput = memo(({ label, value, onChange, placeholder, type = "text", className, rows, icon: Icon }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [isFocused, setIsFocused] = useState(false);

    // Sync with external updates
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleBlur = () => {
        setIsFocused(false);
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    const hasValue = localValue && localValue.length > 0;

    return (
        <div className={cn("relative group", className)}>
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 rounded-xl transition-opacity duration-500 pointer-events-none will-change-[opacity]",
                isFocused ? "opacity-100" : "opacity-0"
            )} />

            <div className="relative bg-black/40 border border-white/10 rounded-xl overflow-hidden transition-colors duration-300 group-hover:border-white/20 focus-within:border-yellow-500/50">
                <div className="flex items-center px-4 py-3">
                    {Icon && <Icon size={18} className={cn("mr-3 transition-colors", isFocused ? "text-yellow-500" : "text-gray-500")} />}
                    <div className="flex-1 relative">
                        {type === "textarea" ? (
                            <textarea
                                value={localValue}
                                onChange={(e) => setLocalValue(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={handleBlur}
                                rows={rows || 4}
                                className="w-full bg-transparent text-white placeholder-transparent outline-none text-sm font-sans resize-y pt-5 pb-1 min-h-[60px]"
                                placeholder={placeholder}
                                id={`input-${label}`}
                            />
                        ) : (
                            <input
                                type={type}
                                value={localValue}
                                onChange={(e) => setLocalValue(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={handleBlur}
                                className="w-full bg-transparent text-white placeholder-transparent outline-none text-sm font-sans h-10 pt-4"
                                placeholder={placeholder}
                                id={`input-${label}`}
                            />
                        )}
                        <label
                            htmlFor={`input-${label}`}
                            className={cn(
                                "absolute left-0 transition-all duration-300 pointer-events-none text-gray-500 font-medium tracking-wide will-change-transform",
                                (isFocused || hasValue)
                                    ? "-top-0 text-[10px] text-yellow-500 uppercase font-bold"
                                    : "top-2.5 text-sm"
                            )}
                        >
                            {label}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
});
FloatingInput.displayName = 'FloatingInput';


const ImagePreview = memo(({ src, label }) => (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 group cursor-pointer hover:border-yellow-500/30 transition-all duration-500 shadow-inner">
        {src ? (
            <>
                <img src={src} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-700 group-hover:text-yellow-500/50 transition-colors">
                <ImageIcon size={48} strokeWidth={1} />
                <span className="text-xs mt-3 font-bruno uppercase tracking-widest opacity-50">No Image Set</span>
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/60 backdrop-blur-md border-t border-white/10">
            <p className="text-xs font-bold text-white uppercase tracking-wider text-center">{label || "Preview Image"}</p>
        </div>
    </div>
));
ImagePreview.displayName = 'ImagePreview';

const TabPill = memo(({ active, label, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={cn(
            "relative flex items-center gap-2 px-6 py-3 rounded-full font-bruno text-xs tracking-wider transition-colors duration-300 overflow-hidden z-10",
            active ? "text-black shadow-[0_0_25px_rgba(234,179,8,0.4)]" : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 z-[-1]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <Icon size={14} className={cn("relative z-10", active ? "stroke-[2.5px]" : "stroke-[2px]")} />
        <span className="relative z-10">{label}</span>
    </button>
));
TabPill.displayName = 'TabPill';

// --- Sub-Sections (Memoized for Performance) ---

const StorySection = memo(({ data, updateField, updateNestedField }) => (
    <motion.div
        key="story"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
        <div className="lg:col-span-8 space-y-8">
            <GlassContainer hoverEffect>
                <SectionTitle title="Narrative Content" subtitle="Define the brand voice and hero messaging." icon={Sparkles} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <FloatingInput label="Hero Section Title" value={data.hero?.title} onChange={(v) => updateField('hero', 'title', v)} className="md:col-span-2" />
                    <FloatingInput label="Story Title (Primary)" value={data.story?.titlePart1} onChange={(v) => updateField('story', 'titlePart1', v)} placeholder="Gold" />
                    <FloatingInput label="Story Title (Accent)" value={data.story?.titlePart2} onChange={(v) => updateField('story', 'titlePart2', v)} placeholder="Standard" />
                </div>

                <div className="space-y-6">
                    <FloatingInput label="Paragraph 1" value={data.story?.description1} onChange={(v) => updateField('story', 'description1', v)} type="textarea" rows={5} />
                    <FloatingInput label="Paragraph 2" value={data.story?.description2} onChange={(v) => updateField('story', 'description2', v)} type="textarea" rows={5} />
                    <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl relative">
                        <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#050505] px-2 text-xs font-bold text-yellow-500 uppercase tracking-widest">Quote Feature</div>
                        <FloatingInput label="Brand Quote" value={data.story?.quote} onChange={(v) => updateField('story', 'quote', v)} type="textarea" rows={3} />
                    </div>
                </div>
            </GlassContainer>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                {data.story?.stats.map((stat, idx) => (
                    <GlassContainer key={idx} className="p-6 flex items-center gap-4 bg-white/[0.03]">
                        <div className="p-3 bg-white/5 rounded-xl text-gray-400">
                            <span className="font-bruno text-lg text-white/20">0{idx + 1}</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <FloatingInput label="Stat Value" value={stat.value} onChange={(v) => updateNestedField('story', idx, 'value', v)} />
                            <FloatingInput label="Label" value={stat.label} onChange={(v) => updateNestedField('story', idx, 'label', v)} />
                        </div>
                    </GlassContainer>
                ))}
            </div>
        </div>

        {/* Visual Sidebar */}
        <div className="lg:col-span-4 space-y-8">
            <GlassContainer className="sticky top-6">
                <SectionTitle title="Visual Assets" subtitle="The face of the story." />
                <div className="space-y-6">
                    <ImagePreview src={data.story?.image} label="Main Story Visual" />
                    <FloatingInput label="Image URL" value={data.story?.image} onChange={(v) => updateField('story', 'image', v)} />
                </div>
            </GlassContainer>
        </div>
    </motion.div>
));
StorySection.displayName = 'StorySection';

const FeaturesSection = memo(({ data, updateNestedField, addItem, deleteItem }) => (
    <motion.div
        key="features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
    >
        <div className="flex justify-between items-center px-4">
            <div>
                <h2 className="text-2xl font-bruno text-white">Value Props</h2>
                <p className="text-gray-400 text-sm">Why clients choose pure luxury.</p>
            </div>
            <button onClick={() => addItem('features')} className="flex items-center gap-2 bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-yellow-500 px-6 py-3 rounded-xl transition-all font-bold text-sm tracking-wide">
                <Plus size={18} /> NEW CARD
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features?.items.map((item, idx) => (
                <GlassContainer key={idx} className="group hover:bg-white/[0.07] transition-colors p-6 flex flex-col h-full rounded-[24px]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                                <Star size={18} />
                            </div>
                            <span className="text-xs text-white/30 font-mono">#{idx + 1}</span>
                        </div>
                        <button onClick={() => deleteItem('features', idx)} className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <FloatingInput label="Title" value={item.title} onChange={(v) => updateNestedField('features', idx, 'title', v)} />
                        <FloatingInput label="Icon Name (Lucide)" value={item.icon} onChange={(v) => updateNestedField('features', idx, 'icon', v)} />
                        <FloatingInput label="Description" value={item.desc} onChange={(v) => updateNestedField('features', idx, 'desc', v)} type="textarea" rows={3} />
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon size={14} className="text-gray-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Card Background</span>
                        </div>
                        <div className="flex gap-2">
                            <FloatingInput value={item.image} onChange={(v) => updateNestedField('features', idx, 'image', v)} placeholder="Image URL" className="flex-1" />
                            <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                                {item.image && <img src={item.image} className="w-full h-full object-cover opacity-70" loading="lazy" />}
                            </div>
                        </div>
                    </div>
                </GlassContainer>
            ))}
        </div>
    </motion.div>
));
FeaturesSection.displayName = 'FeaturesSection';

const LocationsSection = memo(({ data, updateNestedField, addItem, deleteItem }) => (
    <motion.div
        key="locations"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
    >
        <GlassContainer className="text-center p-12">
            <div className="mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-6">
                    <MapPin size={32} className="text-black ml-1" />
                </div>
                <h2 className="text-3xl font-bruno text-white mb-2">Global Presence</h2>
                <p className="text-gray-400">Manage the destinations that appear in your service network.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {data.locations?.list.map((loc, idx) => (
                    <div key={idx} className="group relative">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-yellow-500/50 rounded-full px-5 py-3 transition-all duration-300">
                            <input
                                value={loc}
                                onChange={(e) => updateNestedField('locations', idx, null, e.target.value)}
                                className="bg-transparent text-white font-medium outline-none w-[140px] text-center text-sm"
                            />
                            <button
                                onClick={() => deleteItem('locations', idx)}
                                className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => addItem('locations')}
                    className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500/50 hover:border-yellow-500 px-6 py-3 rounded-full transition-all font-bold text-sm tracking-wide"
                >
                    <Plus size={16} /> ADD NEW
                </button>
            </div>
        </GlassContainer>
    </motion.div>
));
LocationsSection.displayName = 'LocationsSection';

const CtaSection = memo(({ data, updateField }) => (
    <motion.div
        key="cta"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
    >
        <GlassContainer className="overflow-visible">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent shadow-[0_0_20px_rgba(234,179,8,0.5)]" />

            <SectionTitle title="Final Call to Action" subtitle="The closing statement that converts visitors." icon={Shield} />

            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <FloatingInput label="Title Start" value={data.cta?.titlePart1} onChange={(v) => updateField('cta', 'titlePart1', v)} placeholder="READY TO" />
                    <FloatingInput label="Title Highlight" value={data.cta?.titlePart2} onChange={(v) => updateField('cta', 'titlePart2', v)} placeholder="IGNITE?" />
                </div>

                <FloatingInput label="Subtitle Text" value={data.cta?.subtitle} onChange={(v) => updateField('cta', 'subtitle', v)} type="textarea" rows={3} />

                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex-1 mr-6">
                        <FloatingInput label="Button Label" value={data.cta?.buttonText} onChange={(v) => updateField('cta', 'buttonText', v)} />
                    </div>
                    <div className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-full opacity-50 cursor-not-allowed">
                        Button Preview
                    </div>
                </div>
            </div>
        </GlassContainer>
    </motion.div>
));
CtaSection.displayName = 'CtaSection';


// --- Main Page Component ---

export default function AdminAboutUs() {
    const user = useAdminUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('story');

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/about`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Error fetching about data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Save Handler - Wrapped in useCallback
    const handleSave = useCallback(async () => {
        // Prevent saving if data is null
        if (!data) return;

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/about`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) alert('Changes saved successfully!');
        } catch (error) {
            console.error("Error saving data:", error);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    }, [data]);

    // Update Handlers - Wrapped in useCallback for memoization
    const updateField = useCallback((section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    }, []);

    const updateNestedField = useCallback((section, index, field, value) => {
        setData(prev => {
            // Need to handle both 'array of strings' (locations) and 'array of objects' (others)
            const listKey = section === 'locations' ? 'list' : (section === 'story' ? 'stats' : 'items');
            const currentList = prev[section][listKey];
            const newList = [...currentList];

            if (section === 'locations') {
                newList[index] = value;
            } else {
                newList[index] = { ...newList[index], [field]: value };
            }

            return {
                ...prev,
                [section]: { ...prev[section], [listKey]: newList }
            };
        });
    }, []);

    const addItem = useCallback((section) => {
        const listKey = section === 'story' ? 'stats' : (section === 'features' ? 'items' : 'list');
        let newItem;
        if (section === 'features') newItem = { title: 'New Feature', desc: 'Description', icon: 'Star', bg: 'bg-[#0a0a0a]', colSpan: 'md:col-span-1', image: '' };
        else if (section === 'story') newItem = { value: '00', label: 'Label' };
        else newItem = "New Destintation";

        setData(prev => ({
            ...prev,
            [section]: { ...prev[section], [listKey]: [...prev[section][listKey], newItem] }
        }));
    }, []);

    const deleteItem = useCallback((section, index) => {
        setData(prev => {
            const listKey = section === 'story' ? 'stats' : (section === 'features' ? 'items' : 'list');
            const newList = [...prev[section][listKey]];
            newList.splice(index, 1);

            return {
                ...prev,
                [section]: { ...prev[section], [listKey]: newList }
            };
        });
    }, []);

    if (loading || !data) {
        return (
            <div className="flex min-h-screen bg-[#050505] text-white">
                <Sidebar />
                <main className="flex-1 p-10 flex items-center justify-center lg:ml-64">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-6" />
                        <p className="font-bruno text-xl tracking-[0.2em] text-white/50 animate-pulse">SYNCHRONIZING...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 font-sans">
            {/* Ambient Background Effects - Reduced count and complexity for performance */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-900/10 blur-[100px] rounded-full mix-blend-screen opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-yellow-600/10 blur-[100px] rounded-full mix-blend-screen opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
            </div>

            {/* Sidebar */}
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative lg:ml-[280px] z-10">
                {/* Header */}
                <header className="px-10 py-8 border-b border-white/5 bg-black/10 backdrop-blur-sm z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-1 w-12 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            <span className="text-xs font-bold tracking-[0.3em] text-yellow-500 uppercase">Admin Console</span>
                        </div>
                        <h1 className="text-4xl font-bruno text-white tracking-wide">
                            About Us <span className="stroke-text-yellow opacity-80">Manager</span>
                        </h1>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="group relative flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />

                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="stroke-[2.5px]" />}
                        <span className="font-bruno tracking-wider">{saving ? 'SAVING...' : 'PUBLISH CHANGES'}</span>
                    </button>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-10 relative custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto space-y-12">

                        {/* Navigation Tabs */}
                        <div className="flex justify-center w-full">
                            <div className="inline-flex flex-wrap justify-center gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-full">
                                <TabPill active={activeTab === 'story'} onClick={() => setActiveTab('story')} label="Our Story" icon={Crown} />
                                <TabPill active={activeTab === 'features'} onClick={() => setActiveTab('features')} label="Features" icon={Star} />
                                <TabPill active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} label="Locations" icon={MapPin} />
                                <TabPill active={activeTab === 'cta'} onClick={() => setActiveTab('cta')} label="Action Banner" icon={Zap} />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'story' && (
                                <StorySection data={data} updateField={updateField} updateNestedField={updateNestedField} />
                            )}
                            {activeTab === 'features' && (
                                <FeaturesSection data={data} updateNestedField={updateNestedField} addItem={addItem} deleteItem={deleteItem} />
                            )}
                            {activeTab === 'locations' && (
                                <LocationsSection data={data} updateNestedField={updateNestedField} addItem={addItem} deleteItem={deleteItem} />
                            )}
                            {activeTab === 'cta' && (
                                <CtaSection data={data} updateField={updateField} />
                            )}
                        </AnimatePresence>

                        {/* Footer Spacer */}
                        <div className="h-20" />
                    </div>
                </div>
            </main>
        </div>
    );
}
