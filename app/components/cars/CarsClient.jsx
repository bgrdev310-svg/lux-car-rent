"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FilterSidebar from "@/components/ui/filtersidebar";
import Navbar from "../homepage/navbar";
import FooterSection from "../homepage/footer";
import { Filter, X, Search } from "lucide-react";

export default function CarsClient({ initialCars, brands }) {
    const [cars, setCars] = useState(initialCars || []);
    const [filteredCars, setFilteredCars] = useState(initialCars || []);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const searchParams = useSearchParams();

    // State for active filters
    const [activeFilters, setActiveFilters] = useState({
        search: "",
        priceRange: [0, 5000],
        category: null,
        brand: null,
        fuelType: null,
        transmission: null
    });

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const carsPerPage = 6;

    // Mobile filter toggle state
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Initialize brand from URL
    useEffect(() => {
        const brandFromUrl = searchParams.get('brand');
        if (brandFromUrl) {
            setActiveFilters(prev => ({ ...prev, brand: brandFromUrl }));
        }
    }, [searchParams]);

    // Fetch Favorites on Mount
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch('/api/favorites', { credentials: 'include' });
                if (!res.ok) return;
                const data = await res.json();
                const ids = new Set((data.favorites || []).map((c) => c._id || c.id));
                setFavoriteIds(ids);
            } catch (e) { console.error(e); }
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
                const ids = new Set((data.favorites || []).map((c) => c._id || c.id));
                setFavoriteIds(ids);
            }
        } catch (e) {
            // Optimistic update could go here
        }
    };

    // Filter Logic
    useEffect(() => {
        const isClean = !activeFilters.search &&
            (!activeFilters.priceRange || (activeFilters.priceRange[0] === 0 && activeFilters.priceRange[1] === 5000)) &&
            !activeFilters.category && !activeFilters.brand && !activeFilters.fuelType && !activeFilters.transmission;

        if (isClean) {
            setFilteredCars(cars);
            return;
        }

        const filtered = cars.filter(car => {
            const price = car.pricing?.price || car.price || 0;
            const inPriceRange = price >= (activeFilters.priceRange[0] || 0) && price <= (activeFilters.priceRange[1] || 10000);
            const inCategory = !activeFilters.category || car.category === activeFilters.category;
            const inBrand = !activeFilters.brand || car.brand?.toLowerCase() === activeFilters.brand.toLowerCase();
            const inFuel = !activeFilters.fuelType || car.fuelType === activeFilters.fuelType;
            const inTrans = !activeFilters.transmission || car.transmission === activeFilters.transmission;
            const inSearch = !activeFilters.search || (car.title && car.title.toLowerCase().includes(activeFilters.search.toLowerCase()));

            return inPriceRange && inCategory && inBrand && inFuel && inTrans && inSearch;
        });

        setFilteredCars(filtered);
        setCurrentPage(1);
    }, [activeFilters, cars]);

    const handleFilterChange = useCallback((filterType, value) => {
        if (typeof filterType === 'string') {
            setActiveFilters(prev => ({ ...prev, [filterType]: value }));
        } else if (typeof filterType === 'object') {
            setActiveFilters(filterType);
        }
    }, []);

    // Pagination Logic
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        document.getElementById('carListings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="bg-black text-white min-h-screen font-sans">
            <Navbar />

            <main className="container-responsive-xl responsive-padding pt-6 lg:pt-10">
                {/* Luxury Title Section */}
                <div className="mb-2 md:mb-4 text-center relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bruno uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] mb-4">
                        Premium Fleet
                    </h1>
                    <p className="text-gray-400 font-sans mb-6 max-w-2xl mx-auto text-sm md:text-base">
                        Experience the thrill of driving the world's most exclusive supercars and luxury SUVs.
                    </p>

                    {/* Centered Search Bar */}
                    <div className="relative max-w-lg mx-auto mb-4">
                        <div className="flex w-full items-center font-bruno text-lg md:text-xl lg:text-2xl bg-gradient-to-r from-[#FFBB00] to-[#FF9D00] hover:opacity-90 transition duration-300 rounded-full px-4 md:px-5 lg:px-6 py-2 md:py-2 shadow-md h-12 md:h-14 lg:h-14 shadow-[0_0_20px_rgba(255,187,0,0.3)]">
                            <input
                                type="text"
                                value={activeFilters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="bg-transparent outline-none text-black w-full pl-2 md:pl-3 lg:pl-4 pr-10 placeholder-black placeholder-opacity-70 text-base md:text-lg lg:text-xl h-full"
                                placeholder="Search vehicles..."
                            />
                            <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-black/70 pointer-events-none" />
                        </div>
                        {activeFilters.search && (
                            <button
                                onClick={() => handleFilterChange('search', '')}
                                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-black hover:scale-110 transition-transform"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Centered Result Count */}
                    <div className="text-amber-400 font-bruno text-sm tracking-widest uppercase">
                        {filteredCars.length} vehicles found
                        {activeFilters.brand && <span className="text-white ml-2">- {activeFilters.brand}</span>}
                    </div>

                    {/* Gold Glow Behind Title */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                </div>

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="w-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 text-black font-bruno py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Filter size={20} />
                        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row spacing-responsive">
                    {/* Sidebar */}
                    <div className={`lg:w-1/3 ${showMobileFilters ? 'block' : 'hidden lg:block'} pt-2 lg:pt-8`}>
                        {showMobileFilters && (
                            <div className="lg:hidden mb-4">
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <X size={20} /> Close Filters
                                </button>
                            </div>
                        )}

                        <FilterSidebar
                            onFilterChange={handleFilterChange}
                            activeFilters={{ ...activeFilters, hideSearch: true }}
                            cars={cars}
                            brands={brands}
                        />
                    </div>

                    {/* Cars Grid - RESTORED ORIGINAL DESIGN */}
                    <div id="carListings" className="w-full lg:w-2/3 spacing-responsive mt-0">
                        {/* Results count (hidden here as it's now centered above) */}
                        {/* <div className="text-white font-bruno mb-4 md:mb-6 text-center lg:text-left px-2"> ... </div> */}

                        {/* No results message */}
                        {filteredCars.length === 0 && (
                            <div className="bg-[#171616] rounded-xl p-6 md:p-10 text-center mx-2">
                                <h3 className="text-amber-400 font-bruno text-lg md:text-xl mb-3">No vehicles found</h3>
                                <p className="text-gray-300 text-sm md:text-base">Try adjusting your filters to see more options</p>
                            </div>
                        )}

                        {/* Car Cards - EXACT ORIGINAL LAYOUT */}
                        <div className="space-y-6">
                            {currentCars.map((car) => (
                                <div
                                    key={car._id || car.id}
                                    className="relative bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-3xl border border-white/[0.12] overflow-hidden transition-all duration-700 shadow-[0_0_50px_-10px_rgba(234,179,8,0.25)] hover:border-yellow-500/50 hover:shadow-[0_20px_60px_-10px_rgba(234,179,8,0.2)] group max-w-6xl mx-auto"
                                >
                                    {/* Cinematic Gold Lighting Effects */}
                                    <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 bg-gradient-to-br from-yellow-500/20 to-orange-600/5 rounded-full blur-[80px] pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
                                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-yellow-600/5 rounded-full blur-[60px] pointer-events-none opacity-30" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                                    {/* Mobile Layout (Portrait - Stacked) */}
                                    <div className="block md:hidden">
                                        <div className="relative w-full h-56 overflow-hidden rounded-t-lg group transition-all duration-500">
                                            <Image
                                                src={car.mainImage || car.image || '/img/default-car.jpg'}
                                                alt={car.title}
                                                fill
                                                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(car._id); }}
                                                className="absolute top-3 right-3 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                                                    <path
                                                        d="M12 21s-6.716-4.238-9.193-6.716C.804 12.28.5 9.5 2.343 7.657a5 5 0 017.071 0L12 10.243l2.586-2.586a5 5 0 017.071 7.071C18.716 16.762 12 21 12 21z"
                                                        className={favoriteIds.has(car._id) ? 'fill-red-500' : 'fill-transparent'}
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            </button>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#141215]/50 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-15 opacity-75" />
                                            {/* Inner Shadow Overlay for depth */}
                                            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] z-20 pointer-events-none" />
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center mb-3">
                                                {car.logo && <img src={car.logo} alt="logo" className="h-8 w-8 mr-3 object-contain" />}
                                                <h3 className="text-lg font-bold text-white font-bruno truncate">
                                                    {car.title || `${car.brand} ${car.model}`}
                                                </h3>
                                            </div>

                                            <ul className="text-xs text-gray-300 space-y-1 mb-4">
                                                {car.features?.slice(0, 4).map((feature, index) => (
                                                    <li key={index} className="tracking-wide uppercase text-[10px]">{feature}</li>
                                                ))}
                                            </ul>

                                            <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl w-full h-16 overflow-hidden mb-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className={`flex flex-col items-center justify-center flex-1 py-2 ${i < 2 ? 'border-r border-white/10' : ''}`}>
                                                        <div className="relative h-4 w-4 mb-1">
                                                            <img
                                                                src={car.specs && car.specs[i] && car.specs[i].icon ? car.specs[i].icon :
                                                                    i === 0 ? '/img/car-engine.png' :
                                                                        i === 1 ? '/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png' :
                                                                            '/img/fuel-station.png'}
                                                                alt=""
                                                                className="object-contain opacity-80"
                                                                style={{ filter: 'invert(69%) sepia(57%) saturate(2253%) hue-rotate(1deg) brightness(103%) contrast(97%)' }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-white">
                                                            {car.specs && car.specs[i] && car.specs[i].label ? car.specs[i].label : '-'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-amber-400 text-xl font-bruno">{(car.pricing?.daily || car.price) + " $"}</span>
                                                    <span className="text-xs text-gray-400 block">PER DAY</span>
                                                </div>
                                                <Link href={`/cars/${car._id}`}>
                                                    <button className="font-bruno text-sm text-black py-3 px-6 bg-gradient-to-r from-[#FFBB00] to-[#FF9D00] hover:opacity-90 transition duration-300 rounded-full shadow-md">
                                                        BOOK NOW!
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tablet Layout (Horizontal) */}
                                    <div className="hidden md:flex lg:hidden">
                                        <div className="relative w-2/5 overflow-hidden rounded-l-lg group transition-all duration-500">
                                            <Image
                                                src={car.mainImage || car.image || '/img/default-car.jpg'}
                                                alt={car.title}
                                                fill
                                                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 1024px) 40vw"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(car._id); }}
                                                className="absolute top-3 right-3 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                                                    <path
                                                        d="M12 21s-6.716-4.238-9.193-6.716C.804 12.28.5 9.5 2.343 7.657a5 5 0 017.071 0L12 10.243l2.586-2.586a5 5 0 017.071 7.071C18.716 16.762 12 21 12 21z"
                                                        className={favoriteIds.has(car._id) ? 'fill-red-500' : 'fill-transparent'}
                                                        stroke="currentColor" strokeWidth="2"
                                                    />
                                                </svg>
                                            </button>
                                            {/* Inner Shadow Overlay for depth */}
                                            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] z-20 pointer-events-none" />
                                        </div>
                                        <div className="flex-1 p-4 flex">
                                            <div className="flex-1 text-white font-bruno">
                                                <div className="flex items-center mb-3">
                                                    {car.logo && <img src={car.logo} alt="logo" className="h-10 w-10 mr-3 object-contain" />}
                                                    <h3 className="text-xl font-bold truncate">{car.title}</h3>
                                                </div>
                                                <ul className="text-sm text-gray-300 space-y-1">
                                                    {car.features?.slice(0, 4).map((feature, index) => (
                                                        <li key={index} className="tracking-wide uppercase text-xs">{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {/* Specs & Price similar to original... */}
                                        </div>
                                    </div>

                                    {/* Desktop Layout (Exact Original) */}
                                    <div className="hidden lg:flex h-[230px]">
                                        {/* Desktop Image */}
                                        <div className="relative w-[42%] overflow-hidden rounded-lg group transition-all duration-500">
                                            <Image
                                                src={car.mainImage || car.image || '/img/default-car.jpg'}
                                                alt={car.title}
                                                fill
                                                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                                                sizes="33vw"
                                                priority={true} // Priority loading for LCP
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(car._id); }}
                                                className="absolute top-3 right-3 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                                                    <path
                                                        d="M12 21s-6.716-4.238-9.193-6.716C.804 12.28.5 9.5 2.343 7.657a5 5 0 017.071 0L12 10.243l2.586-2.586a5 5 0 017.071 7.071C18.716 16.762 12 21 12 21z"
                                                        className={favoriteIds.has(car._id) ? 'fill-red-500' : 'fill-transparent'}
                                                        stroke="currentColor" strokeWidth="2"
                                                    />
                                                </svg>
                                            </button>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#141215]/50 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-15 opacity-75" />
                                            {/* Inner Shadow Overlay */}
                                            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] z-20 pointer-events-none" />
                                        </div>

                                        {/* Desktop Specs (Vertical Column) */}
                                        <div className="pl-3 flex flex-col items-center justify-center text-white h-full">
                                            <div className="flex flex-col bg-transparent border border-white/5 rounded-2xl w-20 h-[230px] overflow-hidden transition-colors duration-500">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className={`flex flex-col items-center justify-center flex-1 py-1 ${i < 2 ? 'border-b border-white/5' : ''}`} style={{ minHeight: '80px' }}>
                                                        <img
                                                            src={car.specs && car.specs[i] && car.specs[i].icon ? car.specs[i].icon :
                                                                i === 0 ? '/img/car-engine.png' :
                                                                    i === 1 ? '/img/big-black-horse-walking-side-silhouette-avec-queue-et-un-pied-vers-le-haut.png' :
                                                                        '/img/fuel-station.png'}
                                                            alt=""
                                                            className="h-7 mb-1 opacity-80"
                                                            style={{ filter: 'invert(69%) sepia(57%) saturate(2253%) hue-rotate(1deg) brightness(103%) contrast(97%)' }}
                                                        />
                                                        <span className="text-sm font-bold text-white">
                                                            {car.specs && car.specs[i] && car.specs[i].label ? car.specs[i].label : '-'}
                                                            {i === 1 && <span className="text-xs font-normal ml-1">HP</span>}
                                                            {i === 2 && <span className="text-xs font-normal ml-1">L</span>}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Desktop Info */}
                                        <div className="w-[52%] pb-6 mt-4 text-white font-bruno flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center mb-4">
                                                    {car.logo && <img src={car.logo} alt="logo" className="h-12 w-12 mx-4 object-contain" />}
                                                    <h3 className="text-xl font-bold">{car.title}</h3>
                                                </div>
                                                <ul className="text-sm text-gray-300 space-y-1 mb-6 ml-7">
                                                    {car.features?.map((feature, index) => (
                                                        <li key={index} className="tracking-wide uppercase text-[10px]">{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Desktop Price and Button */}
                                        <div className="text-right font-bruno flex-col flex mt-10 mr-3">
                                            <span className="text-amber-400 text-xl mr-3 font-bruno">
                                                {(car.pricing?.daily || car.price) + " $"}
                                            </span>
                                            <span className="text-xs text-gray-400 mr-1">PER DAY</span>
                                            <Link href={`/cars/${car._id}`}>
                                                <button className="font-bruno w-32 text-xs text-black py-2 bg-gradient-to-r from-[#FFBB00] to-[#FF9D00] hover:opacity-90 transition duration-300 rounded-3xl mt-20 shadow-md">
                                                    BOOK NOW!
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 md:mt-12 mb-8 flex justify-center space-x-2">
                                {/* ... (Keeping simplified pagination for cleanliness, or can restore full original) */}
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bruno font-bold ${currentPage === i + 1 ? 'bg-amber-500 text-black' : 'bg-gray-800 text-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </main >
            <FooterSection />
        </div >
    );
}
