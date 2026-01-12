"use client"
import { getApiUrl } from '@/lib/api-config';;
import React, { useState, createContext, useContext, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ArrowRight, ArrowUp, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import components that aren't needed for initial render
const FooterSection = dynamic(() => import("../components/homepage/footer"), { ssr: false });
const Navbar = dynamic(() => import("../components/homepage/navbar"), { ssr: true });

// Brand Context (same as admin)
const BrandContext = createContext();
const API_URL = '/api';
const HOME_ENDPOINT = getApiUrl('/api/home');

const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [logoData, setLogoData] = useState(null);
  const [galleryData, setGalleryData] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('Lamborghini');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeCars, setHomeCars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use AbortController to cancel fetch if it takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const res = await fetch(HOME_ENDPOINT, {
            cache: 'force-cache',
            next: { revalidate: 3600 }, // Cache for 1 hour
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!res.ok) throw new Error('Failed to fetch homepage data');
          const { brands: brandsData, hero, logo, gallery, cars: topCars } = await res.json();
          let finalBrands = Array.isArray(brandsData) ? brandsData : [];

          // Fallback: if no brands came from aggregated endpoint, fetch directly
          if (finalBrands.length === 0) {
            try {
              const br = await fetch(getApiUrl('/api/brands'), {
                cache: 'force-cache',
                next: { revalidate: 3600 }
              });
              if (br.ok) {
                finalBrands = await br.json();
              }
            } catch (_) { }
          }

          setBrands(finalBrands);
          setHeroData(hero || null);
          setLogoData(logo || null);
          setGalleryData(gallery || null);
          setHomeCars(Array.isArray(topCars) ? topCars : []);
        } catch (err) {
          if (err.name === 'AbortError') {
            console.log('Fetch aborted due to timeout');
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error("Critical Fetch Error:", err);
        console.log("Attempted Endpoint:", HOME_ENDPOINT);
        setError(err.message);
        setBrands([]);
        setHeroData(null);
        setLogoData(null);
        setGalleryData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    loading,
    error
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

function Homepage() {
  /* Existing hooks */
  const { heroData, logoData, galleryData, homeCars, selectedBrand, setSelectedBrand, getVisibleBrands, loading, error } = useBrand();

  // Fix Hydration Mismatch: Ensure client renders match server initially
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const visibleBrands = getVisibleBrands();
  const selected = visibleBrands.find((brand) => brand.name === selectedBrand) || visibleBrands[0];

  // Car photos data for carousel - use dynamic data if available
  const carPhotos = (() => {
    const mobilePhotos = galleryData?.mobilePhotos?.filter(photo => photo.isActive && photo.imageUrl);
    if (mobilePhotos && mobilePhotos.length > 0) {
      return mobilePhotos.map(photo => ({
        src: photo.imageUrl,
        alt: photo.alt || "Luxury Car"
      }));
    }
    // Fallback to default images
    return [
      {
        src: "/img/lamboburjdxb.jpg",
        alt: "Lamborghini with Burj Khalifa"
      },
      {
        src: "/img/lamboinside.jpg",
        alt: "Lamborghini Interior"
      }
    ];
  })();

  // Ensure we have valid car photos and current index is within bounds
  const safeCurrentIndex = carPhotos.length > 0 ? Math.min(currentImageIndex, carPhotos.length - 1) : 0;

  // Reset currentImageIndex if it's out of bounds
  useEffect(() => {
    if (carPhotos.length > 0 && currentImageIndex >= carPhotos.length) {
      setCurrentImageIndex(0);
    }
  }, [carPhotos.length, currentImageIndex]);

  const nextImage = () => {
    if (carPhotos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % carPhotos.length);
    }
  };

  const prevImage = () => {
    if (carPhotos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + carPhotos.length) % carPhotos.length);
    }
  };

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  // Experience data
  const experienceData = [
    {
      title: "Premium Service",
      content: "Experience world-class service with our dedicated team of luxury car specialists. From pickup to drop-off, every detail is meticulously handled to ensure your complete satisfaction."
    },
    {
      title: "Flexible Rental",
      content: "Choose from daily, weekly, or monthly rental options. Our flexible terms accommodate your schedule and travel plans perfectly."
    },
    {
      title: "Insurance Coverage",
      content: "Comprehensive insurance coverage included with every rental. Drive with confidence knowing you're fully protected."
    },
    {
      title: "24/7 Support",
      content: "Round-the-clock customer support available for any questions or assistance you may need during your rental period."
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // Fetch current user's favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const ids = new Set((data.favorites || []).map((c) => c._id || c.id));
        setFavoriteIds(ids);
      } catch (e) {
        // ignore errors
      }
    };
    fetchFavorites();
  }, []);

  // Toggle favorite function
  const toggleFavorite = async (carId) => {
    try {
      const res = await fetch(getApiUrl('/api/favorites'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ carId }),
      });
      if (!res.ok) {
        // optionally redirect to login if 401
        return;
      }
      const data = await res.json();
      const ids = new Set((data.favorites || []).map((c) => c._id || c.id));
      setFavoriteIds(ids);
    } catch (e) {
      // ignore errors for now
    }
  };

  // Initialize cars from preloaded home response, fallback to API
  useEffect(() => {
    let aborted = false;
    const hydrate = async () => {
      try {
        setCarsLoading(true);
        if (homeCars.length) {
          setCars(homeCars.slice(0, 3));
          setCarsLoading(false);
          return;
        }
        const response = await fetch(getApiUrl('/api/cars'));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!aborted) setCars(data.slice(0, 3));
      } catch (error) {
        if (!aborted) setCars([]);
      } finally {
        if (!aborted) setCarsLoading(false);
      }
    };
    hydrate();
    return () => {
      aborted = true;
    };
  }, [homeCars]);

  // Smooth scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-red-400 text-xl mb-4">⚠️ Connection Error</div>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!heroData || !heroData.backgroundImage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-yellow-400">
        No hero data available
      </div>
    );
  }

  if (!visibleBrands.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-yellow-400">
        No brands available
      </div>
    );
  }

  return (
    <div className="bg-black overflow-x-hidden">
      {/* Hero Section - Luxury Redesign */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url('${heroData.backgroundImage}')`,
            transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`
          }}
        />

        {/* Enhanced Luxury Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40 z-10" />

        {/* Animated Dust/Grain Overlay (Optional for texture) */}
        <div className="absolute inset-0 bg-[url('/img/noise.png')] opacity-[0.03] mix-blend-overlay z-10 pointer-events-none" />

        {/* Navigation */}
        <div className="relative z-50">
          <Navbar />
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[#0a0a0a] border-l border-[#FFD700]/20 shadow-2xl"
              >
                <div className="flex flex-col p-8 pt-20">
                  {['Home', 'Cars', 'Contact us'].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <Link
                        href={item === 'Home' ? '/hp' : `/${item.toLowerCase().replace(' ', '')}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-5 text-xl font-bruno text-white hover:text-[#FFD700] transition-colors duration-300 border-b border-white/5"
                      >
                        {item}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                  >
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#B38728] text-black font-bruno py-4 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all">
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Content */}
        {/* Hero Content - Rewritten Grid Layout */}
        <div className="relative z-30 w-full max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-4 lg:px-12 min-h-screen pt-32 lg:pt-0">

          {/* Left Side: Text Content */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              {/* Welcome Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4 mb-4"
              >
                <div className="h-[1px] w-12 bg-[#FFD700]" />
                <span className="text-[#FFD700] font-sans tracking-[0.3em] text-xs lg:text-sm uppercase font-medium">
                  Welcome to Lux Car Rental
                </span>
              </motion.div>

              <div className="backdrop-blur-sm p-4 lg:p-0 rounded-3xl lg:bg-transparent lg:backdrop-blur-none">
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
                    <Button className="group relative overflow-hidden bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#B38728] text-black font-bold px-10 py-7 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] font-bruno text-lg tracking-wide border-0">
                      <span className="relative z-10 flex items-center">
                        Explore Fleet
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Link href="/aboutus">
                    <Button variant="outline" className="group border-[#FFD700]/50 text-white hover:bg-[#FFD700]/10 px-10 py-7 rounded-full transition-all duration-300 font-bruno text-lg tracking-wide w-full sm:w-auto backdrop-blur-md">
                      <span className="group-hover:text-[#FFD700] transition-colors">About Us</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Car Card & Find Us Button */}
          <div className="relative h-full flex flex-col justify-center items-end order-1 lg:order-2 min-h-[400px] lg:min-h-[600px]">

            {/* Find Us Button - Fixed High Position & Visible on LG */}
            <Link href="/findus" className="absolute top-[5%] right-0 z-50">
              <motion.button
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-600 text-white px-3 py-8 rounded-full font-bruno font-semibold hover:from-yellow-500 hover:to-yellow-400 hover:text-black transition-all duration-300 shadow-lg"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                <span style={{ letterSpacing: '0.2em' }}>
                  FIND US
                </span>
              </motion.button>
            </Link>

            {/* Car Info Card - Positioned in Flow (Centered/Bottom) - Pushed to Right Edge */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="hidden lg:flex flex-col justify-center pr-0 lg:-mr-12 relative z-10 mt-32"
            >
              <div className="backdrop-blur-lg bg-black/40 p-2 rounded-2xl border border-white/10 w-64 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  {heroData.carCard?.logo && (
                    <img
                      src={heroData.carCard.logo}
                      alt="Car Logo"
                      className="w-8 h-12 lg:w-10 lg:h-14 object-contain"
                    />
                  )}
                  <span className="text-white font-semibold text-lg">
                    {heroData.carCard?.title}
                  </span>
                </div>
                {heroData.carCard?.image && (
                  <img
                    src={heroData.carCard.image}
                    alt={heroData.carCard?.title}
                    className="w-full rounded-lg mb-4"
                  />
                )}
                <div className="flex justify-between mb-4 text-sm text-gray-300">
                  {(heroData.carCard?.specs || []).map((spec, index) => (
                    <span key={index}>{spec}</span>
                  ))}
                </div>
                <Link href="/cars">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold rounded-full transition-all duration-300">
                    Explore Our Cars
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brands Section - Luxury Redesign */}
      <section className="relative py-20 lg:py-28 bg-[#050505] overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Section Header */}
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
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Popular Exotic &
              </span>
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[#FFD700] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm ml-2">
                Luxury Makes
              </span>
            </h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[#FFD700] to-transparent mb-6 opacity-50" />
            <p className="font-sans text-gray-400 text-sm lg:text-base max-w-2xl mx-auto font-light tracking-wide">
              The finest purveyors of supercars, sports cars, and limos
            </p>
          </motion.div>

          {/* Brand Grid */}
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
                    {/* Active Glow */}
                    {selectedBrand === brand.name && (
                      <div className="absolute inset-0 bg-[#FFD700]/5 radial-gradient" />
                    )}

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

                  {/* Active Indicator Line */}
                  {selectedBrand === brand.name && (
                    <motion.div
                      layoutId="activeBrand"
                      className="h-1 w-12 mx-auto mt-4 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]"
                    />
                  )}
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
                    {/* Decorative Background Logo */}
                    {selected.logo && (
                      <div className="absolute -right-10 -bottom-10 opacity-[0.03] select-none pointer-events-none transform rotate-[-15deg]">
                        <img src={selected.logo} alt="" className="w-[400px] h-[400px] object-contain grayscale" />
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center relative z-10">
                      {selected.logo && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8 shadow-2xl"
                        >
                          <img
                            src={selected.logo}
                            alt={selected.name}
                            className="w-14 h-14 object-contain"
                          />
                        </motion.div>
                      )}

                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-3xl lg:text-4xl font-bruno text-white mb-6 uppercase tracking-widest"
                      >
                        {selected.name}
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-base lg:text-lg leading-relaxed max-w-3xl mx-auto mb-10 font-light"
                      >
                        {selected.description}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link href={`/cars?brand=${encodeURIComponent(selected.name)}`}>
                          <button className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#FFD700] to-[#B38728] opacity-100 transition-all duration-300 group-hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
                            <span className="relative flex items-center text-black font-bruno text-sm tracking-widest uppercase">
                              Rent a {selected.name}
                              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                            </span>
                          </button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Car Collection Section - Luxury Redesign */}
      <section className="relative min-h-screen bg-[#050505] py-20 lg:py-32 overflow-hidden">
        {/* Ambient Gold Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#FFD700] font-sans text-sm tracking-[0.3em] uppercase mb-4 opacity-80"
            >
              The Royal Fleet
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-bruno text-4xl md:text-6xl font-bold uppercase tracking-wide mb-6"
            >
              <span className="bg-gradient-to-b from-[#FFF] via-[#E5E5E5] to-[#999] bg-clip-text text-transparent">
                Our Collection
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] drop-shadow-sm mt-2">
                Cars
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-gray-400 text-base leading-relaxed font-light"
            >
              Get your dream car with the settings of your choice. There are many interesting
              offers through our cooperation with various trusted leasing partners.
            </motion.p>
          </div>

          {carsLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-2 border-[#FFD700] border-t-transparent rounded-full shadow-[0_0_15px_#FFD700]"
              />
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 lg:gap-16 max-w-7xl mx-auto">
              {cars.map((car, index) => (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="group relative"
                >
                  {/* Gold Glow Behind Card */}
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] opacity-0 group-hover:opacity-70 blur-md transition-all duration-500" />

                  {/* Main Card Container */}
                  <div className="relative isolate flex flex-col lg:flex-row bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 group-hover:border-[#FFD700]/50 transition-colors duration-500 w-full shadow-2xl">

                    {/* Image Section */}
                    <div className="relative w-full lg:w-[55%] h-72 lg:h-[400px] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10" />
                      <img
                        src={car.mainImage || car.image}
                        alt={car.title}
                        className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Favorite Button */}
                      <button
                        title="Toggle favorite"
                        aria-pressed={favoriteIds.has(car._id)}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(car._id); }}
                        className="absolute top-6 right-6 z-30 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] p-3 rounded-full transition-all duration-300 group/fav"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 transition-colors duration-300">
                          <path
                            d="M12 21s-6.716-4.238-9.193-6.716C.804 12.28.5 9.5 2.343 7.657a5 5 0 017.071 0L12 10.243l2.586-2.586a5 5 0 017.071 7.071C18.716 16.762 12 21 12 21z"
                            className={favoriteIds.has(car._id) ? 'fill-[#FFD700] stroke-[#FFD700]' : 'fill-transparent stroke-white group-hover/fav:stroke-black'}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>

                      {/* Gradient Overlay for Text Visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#0a0a0a] lg:via-[#0a0a0a]/20 lg:to-transparent opacity-90" />
                    </div>

                    {/* Content Section */}
                    <div className="relative w-full lg:w-[45%] p-8 lg:p-10 flex flex-col justify-center bg-[#0a0a0a]/80 backdrop-blur-sm">
                      {/* Subtle Background Pattern */}
                      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none select-none">
                        {car.logo && <img src={car.logo} alt="" className="w-64 h-64 object-contain grayscale" />}
                      </div>

                      {/* Header */}
                      <div className="relative z-10 mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4 mb-3">
                          {car.logo && (
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/10 group-hover:border-[#FFD700]/30 transition-colors">
                              <img src={car.logo} alt="logo" className="w-full h-full object-contain" />
                            </div>
                          )}
                          <span className="text-[#FFD700] font-sans text-xs tracking-[0.2em] uppercase">Premium Class</span>
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-bruno text-white uppercase tracking-wide group-hover:text-[#FFD700] transition-colors duration-300">
                          {car.title}
                        </h3>
                      </div>

                      {/* Specs Grid */}
                      <div className="relative z-10 grid grid-cols-3 gap-4 mb-10">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors duration-300">
                            <img
                              src={car.specs && car.specs[i] && car.specs[i].icon ? car.specs[i].icon :
                                i === 0 ? '/img/car-engine.png' :
                                  i === 1 ? '/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png' :
                                    '/img/fuel-station.png'}
                              alt="spec"
                              className="h-6 w-6 mb-3 opacity-70 invert"
                            />
                            <span className="text-white font-bruno text-sm uppercase">
                              {car.specs && car.specs[i] && car.specs[i].label ? car.specs[i].label : '-'}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                              {i === 1 ? 'Power' : i === 2 ? 'Fuel' : 'Engine'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer / Action */}
                      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-xs tracking-widest uppercase mb-1">Daily Rate</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[#FFD700] text-3xl font-bruno">
                              ${car.pricing?.daily || car.price}
                            </span>
                          </div>
                        </div>
                        <Link href={`/cars/${car._id}`} className="w-full sm:w-auto">
                          <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#B38728] text-black font-bruno text-sm tracking-wider uppercase rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-105 transition-all duration-300">
                            Reserve Machine
                          </button>
                        </Link>
                      </div>

                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
              <p className="text-gray-400 font-bruno text-xl">No masterpieces available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Car Photos Section */}
      {/* Unleash the Extraordinary - Gallery Section */}
      <section className="relative py-24 bg-[#050505] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-bruno text-4xl md:text-5xl lg:text-6xl mb-6 uppercase tracking-wider"
            >
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                Unleash the Extraordinary
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            >
              Go beyond ordinary and indulge in the exceptional. Our luxury cars are designed
              to impress and inspire, providing you with an unforgettable driving experience.
            </motion.p>
          </div>

          {/* Desktop Gallery - Flexbox Layout */}
          <div className="hidden lg:flex gap-6 h-[650px]">
            {/* Left Vertical Image */}
            {galleryData?.desktopPhotos?.[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[280px] group relative rounded-2xl"
              >
                {/* Moving Gold Shadow Layer */}
                <div className="absolute -inset-[2px] rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm z-0">
                  <motion.div
                    className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_90deg,transparent_180deg)]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                </div>

                {/* Card Content */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black border border-white/10 group-hover:border-yellow-500/30 transition-colors duration-500 z-10">
                  <img
                    src={galleryData.desktopPhotos[0].imageUrl}
                    alt={galleryData.desktopPhotos[0].alt || "Luxury Car"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="absolute bottom-6 left-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-yellow-400 font-bruno text-sm tracking-widest uppercase">View Details</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Middle Column - 2 Horizontal Images Stacked */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Top Horizontal */}
              {galleryData?.desktopPhotos?.[1] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 group relative rounded-2xl"
                >
                  {/* Moving Gold Shadow Layer */}
                  <div className="absolute -inset-[2px] rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm z-0">
                    <motion.div
                      className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_90deg,transparent_180deg)]"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                  </div>

                  {/* Card Content */}
                  <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black border border-white/10 group-hover:border-yellow-500/30 transition-colors duration-500 z-10">
                    <img
                      src={galleryData.desktopPhotos[1].imageUrl}
                      alt={galleryData.desktopPhotos[1].alt || "Luxury Car"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  </div>
                </motion.div>
              )}

              {/* Bottom Horizontal */}
              {galleryData?.desktopPhotos?.[2] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 group relative rounded-2xl"
                >
                  {/* Moving Gold Shadow Layer */}
                  <div className="absolute -inset-[2px] rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm z-0">
                    <motion.div
                      className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_90deg,transparent_180deg)]"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                  </div>

                  {/* Card Content */}
                  <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black border border-white/10 group-hover:border-yellow-500/30 transition-colors duration-500 z-10">
                    <img
                      src={galleryData.desktopPhotos[2].imageUrl}
                      alt={galleryData.desktopPhotos[2].alt || "Luxury Car"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Vertical Image */}
            {galleryData?.desktopPhotos?.[3] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex-shrink-0 w-[280px] group relative rounded-2xl"
              >
                {/* Moving Gold Shadow Layer */}
                <div className="absolute -inset-[2px] rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm z-0">
                  <motion.div
                    className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_90deg,transparent_180deg)]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                </div>

                {/* Card Content */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black border border-white/10 group-hover:border-yellow-500/30 transition-colors duration-500 z-10">
                  <img
                    src={galleryData.desktopPhotos[3].imageUrl}
                    alt={galleryData.desktopPhotos[3].alt || "Luxury Car"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="absolute bottom-6 left-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-yellow-400 font-bruno text-sm tracking-widest uppercase">View Details</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile Carousel (Enhanced) */}
          <div className="lg:hidden">
            <div
              className="relative rounded-2xl overflow-hidden aspect-[4/5] group bg-gray-900 border border-white/10"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                {carPhotos.length > 0 && (
                  <motion.img
                    key={safeCurrentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={carPhotos[safeCurrentIndex].src}
                    alt="Gallery Image"
                    className="w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>

              {/* Mobile Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />

              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                {carPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === safeCurrentIndex ? 'bg-yellow-400 w-8' : 'bg-white/30 w-1.5'}`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-yellow-500 hover:text-black transition-all z-20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-yellow-500 hover:text-black transition-all z-20"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {/* Experience Section */}
      <section className="relative py-24 bg-[#050505] overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

            {/* Left side: Content & Accordion */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bruno mb-12 leading-tight text-white">
                  Don't Wait any Longer <br />
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
                    to experience it !
                  </span>
                </h2>
              </motion.div>

              <div className="space-y-4">
                {experienceData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`group relative rounded-2xl transition-all duration-500 border ${openIndex === index
                      ? "bg-black/80 border-yellow-500/50 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]"
                      : "bg-white/5 border-white/10 hover:border-yellow-500/30 hover:bg-white/10"
                      }`}
                  >
                    {/* Active Golden Side Line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-yellow-300 to-amber-600 transition-all duration-500 ${openIndex === index ? "opacity-100" : "opacity-0"
                      }`} />

                    <button
                      onClick={() => handleToggle(index)}
                      className="w-full px-8 py-6 flex items-center justify-between font-playfair text-xl md:text-2xl text-left"
                    >
                      <span className={`transition-colors duration-300 ${openIndex === index ? "text-yellow-400 font-medium" : "text-white group-hover:text-yellow-200"
                        }`}>
                        {item.title}
                      </span>

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${openIndex === index
                        ? "border-yellow-500 bg-yellow-500 text-black rotate-180"
                        : "border-gray-700 text-gray-400 group-hover:border-yellow-400/50 group-hover:text-yellow-200"
                        }`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${openIndex === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                        }`}>
                      <div className="px-8 pb-8 pr-12">
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light font-sans tracking-wide">
                          {item.content}
                        </p>
                        {item.button && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold px-8 py-3 rounded-full shadow-lg shadow-yellow-500/20"
                          >
                            {item.button}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side: Luxurious Image Showcase */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group w-full max-w-xl"
              >
                {/* Main Gold Glow/Shadow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-amber-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />

                <div className="relative rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/50">
                  {/* Image Layer */}
                  <div className="relative aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
                    <img
                      src="/img/lamboinside.jpg"
                      alt="Luxury Interior"
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Premium Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-yellow-900/10 mix-blend-overlay" />

                    {/* Floating Content on Image */}
                    <div className="absolute bottom-10 left-8 right-8">
                      <div className="backdrop-blur-md bg-black/40 border border-white/10 p-6 rounded-2xl transform transition-all duration-500 translate-y-4 group-hover:translate-y-0 opacity-90 group-hover:opacity-100">
                        <p className="font-bruno text-white/90 text-sm tracking-[0.2em] uppercase mb-2">Internal Comfort</p>
                        <h3 className="font-playfair text-2xl text-white italic">"Details make perfection"</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
// Simple loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full"
    />
  </div>
);

// Export the component wrapped in the provider
export default function HomePageWrapper() {
  return (
    <BrandProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Homepage />
      </Suspense>
    </BrandProvider>
  );
}