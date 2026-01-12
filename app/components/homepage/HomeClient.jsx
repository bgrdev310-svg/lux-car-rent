"use client";
import React, { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X } from "lucide-react";
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import("../homepage/navbar"), { ssr: true });

// Brand Context
const BrandContext = createContext();

const BrandProvider = ({ children, brands, heroData, logoData, galleryData, homeCars }) => {
    const [selectedBrand, setSelectedBrand] = useState('Lamborghini');

    const getVisibleBrands = () => {
        return brands.filter(brand => brand.isActive || brand.isVisible);
    };

    const value = {
        brands,
        heroData,
        logoData,
        galleryData,
        homeCars,
        selectedBrand,
        setSelectedBrand,
        getVisibleBrands,
    };

    return (
        <BrandContext.Provider value={value}>
            {children}
        </BrandContext.Provider>
    );
};

const useBrand = () => {
    const context = useContext(BrandContext);
    if (context === undefined) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return context;
};

// Main Client Component
function HomeContent() {
    const { heroData, homeCars, selectedBrand, setSelectedBrand, getVisibleBrands } = useBrand();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [cars, setCars] = useState(homeCars || []);

    const visibleBrands = getVisibleBrands();
    const selected = visibleBrands.find((brand) => brand.name === selectedBrand) || visibleBrands[0];

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch favorites on client side
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch('/api/favorites', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    const ids = new Set((data.favorites || []).map(c => c._id || c.id));
                    setFavoriteIds(ids);
                }
            } catch (e) { }
        };
        fetchFavorites();
    }, []);

    const toggleFavorite = async (carId) => {
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ carId }),
            });
            if (res.ok) {
                const data = await res.json();
                const ids = new Set((data.favorites || []).map(c => c._id || c.id));
                setFavoriteIds(ids);
            }
        } catch (e) { }
    };

    if (!mounted) return null; // Avoid hydration mismatch

    if (!heroData || !heroData.backgroundImage) return null;

    return (
        <div className="bg-black overflow-x-hidden font-sans">
            {/* Hero Section */}
            <section className="relative min-h-screen w-full overflow-hidden">
                {/* Background with parallax */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out"
                    style={{
                        backgroundImage: `url('${heroData.backgroundImage}')`,
                        transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`
                    }}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-black/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40 z-10" />
                <div className="absolute inset-0 bg-[url('/img/noise.png')] opacity-[0.03] mix-blend-overlay z-10 pointer-events-none" />

                {/* Navbar */}
                <div className="relative z-50">
                    <Navbar />
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 lg:hidden"
                        >
                            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[#0a0a0a] border-l border-[#FFD700]/20 shadow-2xl p-8 pt-20 flex flex-col"
                            >
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="absolute top-6 right-6 text-white hover:text-yellow-500"
                                >
                                    <X size={24} />
                                </button>
                                {['Home', 'Cars', 'Contact us'].map((item) => (
                                    <Link
                                        key={item}
                                        href={item === 'Home' ? '/hp' : `/${item.toLowerCase().replace(' ', '')}`}
                                        className="py-5 text-xl font-bruno text-white hover:text-[#FFD700] border-b border-white/5"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                ))}
                                <div className="mt-8">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#B38728] text-black font-bruno py-4 rounded-xl">
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Content - Rewritten Grid Layout */}
                <div className="relative z-30 w-full max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-4 lg:px-12 min-h-screen pt-32 lg:pt-0">

                    {/* Left Side: Text Content */}
                    <div className="flex flex-col justify-center order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-[1px] w-12 bg-[#FFD700]" />
                                <span className="text-[#FFD700] font-sans tracking-[0.3em] text-xs lg:text-sm uppercase font-medium">
                                    Welcome to Lux Car Rental
                                </span>
                            </div>

                            <h1 className="font-bruno text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] mb-8 lg:mb-10">
                                Where <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-500">Prestige</span>
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#D4AF37] drop-shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                                    Meets Power
                                </span>
                            </h1>

                            <p className="text-gray-400 text-sm lg:text-lg max-w-xl mb-10 font-light leading-relaxed">
                                Experience the thrill of the extraordinary. Our curated fleet of world-class supercars awaits your command.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link href="/cars">
                                    <Button className="group relative overflow-hidden bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#B38728] text-black font-bold px-10 py-7 rounded-full transition-all duration-300 transform hover:scale-105 font-bruno text-lg tracking-wide border-0">
                                        <span className="relative z-10 flex items-center">
                                            Explore Fleet
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/aboutus">
                                    <Button variant="outline" className="group border-[#FFD700]/50 text-white hover:bg-[#FFD700]/10 px-10 py-7 rounded-full transition-all duration-300 font-bruno text-lg tracking-wide w-full sm:w-auto backdrop-blur-md">
                                        About Us
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Car Card & Find Us Button */}
                    <div className="relative h-full flex flex-col justify-center items-end order-1 lg:order-2 min-h-[400px] lg:min-h-[600px]">

                        {/* Find Us Button - Fixed High Position */}
                        <Link href="/findus" className="absolute top-0 right-0 lg:top-32 z-50">
                            <motion.button
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="hidden xl:flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-600 text-white px-1 py-10 rounded-full font-bruno font-semibold hover:from-yellow-500 hover:to-yellow-400 hover:text-black transition-all duration-300 shadow-lg"
                                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            >
                                <span style={{ letterSpacing: '0.2em' }}>FIND US</span>
                            </motion.button>
                        </Link>

                        {/* Car Card - Positioned in Flow (Centered/Bottom) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="hidden lg:flex flex-col justify-center pr-16 lg:pr-16 relative z-10 mt-20"
                        >
                            <div className="backdrop-blur-lg bg-black/40 p-2 rounded-2xl border border-white/10 w-64 shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    {heroData.carCard?.logo && <img src={heroData.carCard.logo} alt="Car Logo" className="w-10 h-14 object-contain" />}
                                    <span className="text-white font-semibold text-lg">{heroData.carCard?.title}</span>
                                </div>
                                {heroData.carCard?.image && <img src={heroData.carCard.image} alt={heroData.carCard?.title} className="w-full rounded-lg mb-4" />}
                                <div className="flex justify-between mb-4 text-sm text-gray-300">
                                    {(heroData.carCard?.specs || []).map((spec, index) => (
                                        <span key={index}>{spec}</span>
                                    ))}
                                </div>
                                <Link href="/cars">
                                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold rounded-full">
                                        Explore Our Cars
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Brands Section */}
            <section className="relative py-20 lg:py-28 bg-[#050505] overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block text-[#FFD700] font-sans text-xs tracking-[0.3em] uppercase mb-3 opacity-80">
                            Elite Partners
                        </span>
                        <h2 className="font-bruno text-3xl lg:text-5xl font-bold tracking-wide mb-6 text-white uppercase">
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Popular Exotic &</span>
                            <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-[#FFD700] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm ml-2">Luxury Makes</span>
                        </h2>
                    </motion.div>

                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-8 mb-16">
                            {visibleBrands.map((brand, index) => (
                                <motion.div
                                    key={brand.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    onClick={() => setSelectedBrand(brand.name)}
                                    className="group cursor-pointer"
                                >
                                    <div className={cn(
                                        "relative h-24 sm:h-32 lg:h-40 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500",
                                        selectedBrand === brand.name
                                            ? "bg-gradient-to-b from-[#1a1a1a] to-black border border-[#FFD700] shadow-[0_0_30px_-10px_rgba(255,215,0,0.3)] transform scale-105"
                                            : "bg-[#0a0a0a] border border-white/5 hover:border-[#FFD700]/30 hover:bg-[#111]"
                                    )}>
                                        {selectedBrand === brand.name && <div className="absolute inset-0 bg-[#FFD700]/5 radial-gradient" />}
                                        {brand.logo && (
                                            <img
                                                src={brand.logo}
                                                alt={brand.name}
                                                className={cn(
                                                    "relative z-10 w-auto h-12 sm:h-14 lg:h-16 object-contain transition-all duration-500 filter",
                                                    selectedBrand === brand.name
                                                        ? "brightness-100 scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                                                        : "brightness-75 grayscale group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105"
                                                )}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Selected Brand Info */}
                        <AnimatePresence mode="wait">
                            {selected && (
                                <motion.div
                                    key={selected.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-[#FFD700]/5 blur-3xl rounded-[3rem] -z-10" />
                                    <div className="backdrop-blur-md bg-[#0a0a0a]/90 p-8 lg:p-12 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                                        <div className="flex flex-col items-center text-center relative z-10">
                                            <h3 className="text-3xl lg:text-4xl font-bruno text-white mb-6 uppercase tracking-widest">{selected.name}</h3>
                                            <p className="text-gray-400 text-base lg:text-lg leading-relaxed max-w-3xl mx-auto mb-10 font-light">{selected.description}</p>
                                            <Link href={`/cars?brand=${encodeURIComponent(selected.name)}`}>
                                                <button className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full">
                                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#FFD700] to-[#B38728] opacity-100 transition-all duration-300 group-hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
                                                    <span className="relative flex items-center text-black font-bruno text-sm tracking-widest uppercase">
                                                        Rent a {selected.name} <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Collection Section - SSR Hydrated */}
            <section className="relative min-h-screen bg-[#050505] py-20 lg:py-32 overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <span className="inline-block text-[#FFD700] font-sans text-sm tracking-[0.3em] uppercase mb-4 opacity-80">
                            The Royal Fleet
                        </span>
                        <h2 className="font-bruno text-4xl md:text-6xl font-bold uppercase tracking-wide mb-6">
                            <span className="bg-gradient-to-b from-[#FFF] via-[#E5E5E5] to-[#999] bg-clip-text text-transparent">Our Collection</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] drop-shadow-sm mt-2">Cars</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:gap-16 max-w-7xl mx-auto">
                        {cars.map((car, index) => (
                            <motion.div
                                key={car._id || index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="group relative"
                            >
                                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] opacity-0 group-hover:opacity-70 blur-md transition-all duration-500" />
                                <div className="relative isolate flex flex-col lg:flex-row bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 group-hover:border-[#FFD700]/50 transition-colors duration-500 w-full shadow-2xl">
                                    <div className="relative w-full lg:w-[55%] h-72 lg:h-[400px] overflow-hidden">
                                        <img src={car.mainImage || car.image} alt={car.title} className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleFavorite(car._id); }}
                                            className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-full hover:bg-black/80 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
                                                <path
                                                    d="M12 21s-6.716-4.238-9.193-6.716C.804 12.28.5 9.5 2.343 7.657a5 5 0 017.071 0L12 10.243l2.586-2.586a5 5 0 017.071 7.071C18.716 16.762 12 21 12 21z"
                                                    className={favoriteIds.has(car._id) ? 'fill-red-500' : 'fill-transparent'}
                                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={favoriteIds.has(car._id) ? 'text-red-500' : 'text-white'}
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="w-full lg:w-[45%] p-8 lg:p-12 flex flex-col justify-between relative bg-gradient-to-br from-[#0a0a0a] to-[#000]">
                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                {car.brandLogo && <img src={car.brandLogo} alt={car.brand} className="w-12 h-12 object-contain opacity-80" />}
                                                <h3 className="text-2xl lg:text-3xl font-bruno text-white uppercase">{car.title || `${car.brand} ${car.model}`}</h3>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-8">
                                                {(car.specs || []).slice(0, 3).map((spec, i) => (
                                                    <div key={i} className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                                        <span className="text-[#FFD700] font-bold text-lg">{spec.label || spec.value || spec}</span>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">{spec.name || 'Spec'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/10">
                                            <div>
                                                <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Daily Rate</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-[#FFD700] text-3xl font-bruno">{car.price || car.pricing?.daily}$</span>
                                                    <span className="text-gray-500">/day</span>
                                                </div>
                                            </div>
                                            <Link href={`/cars/${car._id}`}>
                                                <Button className="bg-[#FFD700] text-black hover:bg-[#FDB931] font-bold rounded-xl px-8 py-6 text-lg font-bruno transition-transform hover:scale-105">
                                                    Book Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function HomeClient({ brands, heroData, logoData, galleryData, homeCars }) {
    return (
        <BrandProvider
            brands={brands}
            heroData={heroData}
            logoData={logoData}
            galleryData={galleryData}
            homeCars={homeCars}
        >
            <HomeContent />
        </BrandProvider>
    );
}
