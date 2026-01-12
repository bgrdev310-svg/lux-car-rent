"use client"
import { useState, useEffect, useCallback } from "react";
// Fix the import path for PriceSlider - adjust to match your project structure
import PriceSlider from "../comp-265";  // Adjust this path based on where PriceSlider is located
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import BrandSelectionModal from "@/app/components/cars/BrandSelectionModal";

export default function FilterSidebar({ onFilterChange, activeFilters = {}, cars = [] }) {
  // Initialize state from props but only on first render
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Initialize search state from props or empty string
  const [searchValue, setSearchValue] = useState(activeFilters.search || '');

  const [isBrandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(activeFilters.brand || '');

  // Mobile filter expansion states
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    brand: false,
    fuel: false,
    transmission: false
  });

  // Track active filters locally
  const [localActiveFilters, setLocalActiveFilters] = useState({
    search: activeFilters.search ? true : false,
    price: activeFilters.priceRange ? true : false,
    category: activeFilters.category || null,
    brand: activeFilters.brand || null,
    fuelType: activeFilters.fuelType || null,
    transmission: activeFilters.transmission || null
  });

  // State for brands from database
  const [carBrands, setCarBrands] = useState([]);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (response.ok) {
          const data = await response.json();
          setCarBrands(data);
        } else {
          console.error('Failed to fetch brands');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  // Category options
  const categories = [
    { icon: "/img/supercar-gold.png", label: "Supercar", imgClass: "h-8 md:h-10", imgMb: "mb-2 md:mb-5", imgMt: "mt-1 md:mt-3" },
    { icon: "/img/luxury-car-gold.png", label: "Luxury Car", imgClass: "h-8 md:h-12", imgMb: "mb-2 md:mb-5", imgMt: "mt-0" },
    { icon: "/img/suvcar-gold.png", label: "SUV Car", imgClass: "h-8 md:h-11", imgMb: "mb-2 md:mb-5", imgMt: "mt-0" },
    { icon: "/img/roadster-car-gold.png", label: "Convertible", imgClass: "h-8 md:h-11", imgMb: "mb-2 md:mb-5", imgMt: "mt-0" },
  ];

  // Fuel types
  const fuelTypes = [
    { icon: "/img/fuel-station-gold.png", label: "Petrol" },
    { icon: "/img/diesel-gold.png", label: "Diesel" },
    { icon: "/img/fuel-gold.png", label: "Hybrid" },
    { icon: "/img/flash-gold.png", label: "Electric" },
  ];

  // Transmission types
  const transmissionTypes = [
    { icon: "/img/transmission-gold.png", label: "Manual" },
    { icon: "/img/gear-gold.png", label: "Automatic" },
  ];

  // Toggle section expansion (mobile)
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mark initial mount as complete after component mounts
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, []);

  // Update local state when activeFilters prop changes
  useEffect(() => {
    if (isInitialMount) return;

    // Update searchValue when activeFilters.search changes but NOT when typing
    if (searchValue !== activeFilters.search && !document.activeElement?.id === "search-input") {
      setSearchValue(activeFilters.search || '');
    }

    setSelectedBrand(activeFilters.brand || '');
    setLocalActiveFilters(prev => ({
      ...prev,
      search: !!activeFilters.search,
      price: activeFilters.priceRange &&
        (activeFilters.priceRange[0] !== 0 || activeFilters.priceRange[1] !== 10000),
      category: activeFilters.category || null,
      brand: activeFilters.brand || null,
      fuelType: activeFilters.fuelType || null,
      transmission: activeFilters.transmission || null
    }));
  }, [activeFilters, isInitialMount, searchValue]);

  // Handle search input changes with debounce
  const handleSearchChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    // Update local filter state for UI immediately
    setLocalActiveFilters(prev => ({
      ...prev,
      search: newValue.trim().length > 0
    }));

    // Apply search filter immediately
    if (onFilterChange) {
      onFilterChange('search', newValue);
    }
  }, [onFilterChange]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleCategorySelect = useCallback((label) => {
    const newCategory = localActiveFilters.category === label ? null : label;
    setLocalActiveFilters(prev => ({
      ...prev,
      category: newCategory
    }));
    if (onFilterChange) {
      onFilterChange('category', newCategory);
    }
  }, [localActiveFilters.category, onFilterChange]);

  const handleBrandSelect = useCallback((brand) => {
    setSelectedBrand(brand);
    setBrandDropdownOpen(false);
    setLocalActiveFilters(prev => ({
      ...prev,
      brand: brand
    }));
    if (onFilterChange) {
      onFilterChange('brand', brand);
    }
  }, [onFilterChange]);

  const handleFuelTypeSelect = useCallback((label) => {
    const newFuelType = localActiveFilters.fuelType === label ? null : label;
    setLocalActiveFilters(prev => ({
      ...prev,
      fuelType: newFuelType
    }));
    if (onFilterChange) {
      onFilterChange('fuelType', newFuelType);
    }
  }, [localActiveFilters.fuelType, onFilterChange]);

  const handleTransmissionSelect = useCallback((label) => {
    const newTransmission = localActiveFilters.transmission === label ? null : label;
    setLocalActiveFilters(prev => ({
      ...prev,
      transmission: newTransmission
    }));
    if (onFilterChange) {
      onFilterChange('transmission', newTransmission);
    }
  }, [localActiveFilters.transmission, onFilterChange]);

  // Fixed price filter handler
  const handlePriceFilterChange = useCallback((isActive, values) => {
    setLocalActiveFilters(prev => ({
      ...prev,
      price: isActive
    }));
    if (onFilterChange && values) {
      onFilterChange('priceRange', values);
    }
  }, [onFilterChange]);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setSearchValue('');
    setSelectedBrand('');
    setLocalActiveFilters({
      search: false,
      price: false,
      category: null,
      brand: null,
      fuelType: null,
      transmission: null
    });

    if (onFilterChange) {
      onFilterChange({
        search: '',
        priceRange: [0, 10000],
        category: null,
        brand: null,
        fuelType: null,
        transmission: null
      });
    }
  }, [onFilterChange]);

  // Clear search specifically
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setLocalActiveFilters(prev => ({
      ...prev,
      search: false
    }));
    if (onFilterChange) {
      onFilterChange('search', '');
    }
  }, [onFilterChange]);

  // Apply all filters at once
  const applyAllFilters = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({
        search: searchValue,
        priceRange: activeFilters.priceRange || [0, 10000],
        category: localActiveFilters.category,
        brand: selectedBrand,
        fuelType: localActiveFilters.fuelType,
        transmission: localActiveFilters.transmission
      });
    }
  }, [
    searchValue,
    activeFilters.priceRange,
    localActiveFilters.category,
    selectedBrand,
    localActiveFilters.fuelType,
    localActiveFilters.transmission,
    onFilterChange
  ]);

  // Count active filters
  const activeFilterCount = Object.values(localActiveFilters).filter(value =>
    value === true || (value !== false && value !== null)
  ).length;

  return (
    <aside className="text-white px-2 md:px-3 lg:px-1 py-2 md:py-3 space-y-4 md:space-y-6 lg:space-y-10 font-playfair">
      {/* Active Filter Summary - Mobile Optimized */}
      {activeFilterCount > 0 && (
        <div className="bg-gray-900/70 rounded-lg p-2 md:p-3 border border-amber-500/20">
          <div className="flex justify-between items-center mb-2">
            <div className="text-amber-300 font-medium text-sm md:text-base">
              Active: {activeFilterCount}
            </div>
            <Button
              onClick={resetAllFilters}
              className="bg-transparent hover:bg-amber-900/30 text-amber-400 px-2 py-1 text-xs flex items-center gap-1"
            >
              <X size={12} /> Reset
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {localActiveFilters.search && (
              <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full flex items-center">
                <span className="hidden sm:inline">Search: "</span>
                <span className="sm:hidden">🔍</span>
                {searchValue.length > 10 ? `${searchValue.substring(0, 10)}...` : searchValue}
                <span className="hidden sm:inline">"</span>
                <button onClick={clearSearch} className="ml-1 text-amber-400">
                  <X size={10} />
                </button>
              </span>
            )}
            {localActiveFilters.price && (
              <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full flex items-center">
                <span className="hidden sm:inline">Price Filter</span>
                <span className="sm:hidden">💰</span>
                <button onClick={() => handlePriceFilterChange(false)} className="ml-1 text-amber-400">
                  <X size={10} />
                </button>
              </span>
            )}
            {localActiveFilters.category && (
              <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full flex items-center">
                {localActiveFilters.category}
                <button onClick={() => handleCategorySelect(localActiveFilters.category)} className="ml-1 text-amber-400">
                  <X size={10} />
                </button>
              </span>
            )}
            {localActiveFilters.brand && (
              <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full flex items-center">
                {localActiveFilters.brand}
                <button onClick={() => setSelectedBrand('')} className="ml-1 text-amber-400">
                  <X size={10} />
                </button>
              </span>
            )}
            {localActiveFilters.fuelType && (
              <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full flex items-center">
                {localActiveFilters.fuelType}
                <button onClick={() => handleFuelTypeSelect(localActiveFilters.fuelType)} className="ml-1 text-amber-400">
                  <X size={10} />
                </button>
              </span>
            )}
            {localActiveFilters.transmission && (
              <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full flex items-center">
                {localActiveFilters.transmission}
                <button onClick={() => handleTransmissionSelect(localActiveFilters.transmission)} className="ml-1 text-amber-400">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Search Bar - Mobile Optimized */}
      {!activeFilters.hideSearch && (
        <div className="relative">
          <div className="flex w-full items-center font-bruno text-lg md:text-xl lg:text-2xl bg-gradient-to-r from-[#FFBB00] to-[#FF9D00] hover:opacity-90 transition duration-300 rounded-full px-3 md:px-4 lg:px-5 py-2 md:py-1 shadow-md h-10 md:h-11 lg:h-12">
            <div className="relative w-full">
              <input
                id="search-input"
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                className="bg-transparent outline-none text-black w-full pl-2 md:pl-3 lg:pl-4 pr-8 md:pr-10 placeholder-black placeholder-opacity-70 text-sm md:text-base lg:text-lg"
                placeholder="Search vehicles..."
              />

              <img
                src="/icons/search.svg"
                alt="Search Icon"
                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5"
              />
            </div>
          </div>
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-8 md:right-10 lg:right-14 top-1/2 transform -translate-y-1/2 text-black"
            >
              <X size={14} className="md:hidden" />
              <X size={18} className="hidden md:block" />
            </button>
          )}
        </div>
      )}


      {/* Price Range - Always Visible */}
      < div >
        <PriceSlider
          onFilterChange={handlePriceFilterChange}
          initialRange={activeFilters.priceRange || [0, 10000]}
          cars={cars}
          hideRangeDisplay={true} /* Hide the price range display section */
        />
      </div >

      {/* Category - Collapsible on Mobile */}
      < div >
        <button
          className="flex justify-between items-center w-full lg:pointer-events-none"
          onClick={() => toggleSection('category')}
        >
          <h3 className="font-bruno text-lg md:text-xl uppercase text-gray-100 mb-2 lg:mb-5">Category</h3>
          <ChevronDown
            size={20}
            className={`lg:hidden transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`${expandedSections.category ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 text-center">
            {categories.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col items-center mb-2 md:mb-4 cursor-pointer rounded-xl p-1 md:p-2 transition-all duration-200 ${localActiveFilters.category === item.label ? 'bg-amber-900/30 border border-amber-500/40' : 'hover:bg-gray-800/50'}`}
                onClick={() => handleCategorySelect(item.label)}
              >
                <img src={item.icon} alt={item.label} className={`${item.imgClass} ${item.imgMb} ${item.imgMt}`} />
                <span className="font-bruno text-xs md:text-sm">{item.label}</span>
                {localActiveFilters.category === item.label && (
                  <div className="mt-1 bg-amber-500 rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                    <Check size={10} className="text-black md:w-3 md:h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div >

      {/* Select Brand - Modal Trigger */}
      < div className="text-center space-y-2" >
        <div className="w-full">
          <h3 className="font-bruno text-lg md:text-xl uppercase text-gray-100 mb-2 lg:mb-5 text-left">Select Brand</h3>
          <button
            onClick={() => setBrandDropdownOpen(true)}
            className={`font-bruno w-full text-black font-bold py-3 px-4 bg-gradient-to-r from-[#FFBB00] to-[#FF9D00] hover:opacity-90 transition duration-300 rounded-xl shadow-md flex items-center justify-between text-sm md:text-base ${selectedBrand ? 'border-2 border-white' : ''}`}
          >
            {selectedBrand ? (
              <div className="flex items-center gap-3">
                {carBrands.find(b => b.name === selectedBrand)?.logo && (
                  <img
                    src={carBrands.find(b => b.name === selectedBrand)?.logo}
                    alt={`${selectedBrand} logo`}
                    className="w-6 h-6 object-contain"
                  />
                )}
                <span className="truncate">{selectedBrand}</span>
              </div>
            ) : (
              <span className="truncate">SELECT BRAND</span>
            )}
            <ChevronDown size={20} />
          </button>

          {/* Brand Modal */}
          <BrandSelectionModal
            isOpen={isBrandDropdownOpen}
            onClose={() => setBrandDropdownOpen(false)}
            brands={carBrands}
            selectedBrand={selectedBrand}
            onSelect={(brand) => handleBrandSelect(brand)}
          />
        </div>
      </div >

      {/* Fuel Type - Collapsible on Mobile */}
      < div >
        <button
          className="flex justify-between items-center w-full lg:pointer-events-none"
          onClick={() => toggleSection('fuel')}
        >
          <h3 className="font-bruno text-lg md:text-xl uppercase text-gray-100 mb-2 lg:mb-5">Fuel Type</h3>
          <ChevronDown
            size={20}
            className={`lg:hidden transition-transform ${expandedSections.fuel ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`${expandedSections.fuel ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 text-center">
            {fuelTypes.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer rounded-xl p-1 md:p-2 transition-all duration-200 ${localActiveFilters.fuelType === item.label ? 'bg-amber-900/30 border border-amber-500/40' : 'hover:bg-gray-800/50'}`}
                onClick={() => handleFuelTypeSelect(item.label)}
              >
                <img src={item.icon} alt={item.label} className="h-8 md:h-10 lg:h-12 mb-2 md:mb-4" />
                <span className="font-bruno text-xs md:text-sm">{item.label}</span>
                {localActiveFilters.fuelType === item.label && (
                  <div className="mt-1 bg-amber-500 rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                    <Check size={10} className="text-black md:w-3 md:h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div >

      {/* Transmission - Collapsible on Mobile */}
      < div >
        <button
          className="flex justify-between items-center w-full lg:pointer-events-none"
          onClick={() => toggleSection('transmission')}
        >
          <h3 className="font-bruno text-lg md:text-xl uppercase text-gray-100 mb-2 lg:mb-5">Transmission</h3>
          <ChevronDown
            size={20}
            className={`lg:hidden transition-transform ${expandedSections.transmission ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`${expandedSections.transmission ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 text-center">
            {transmissionTypes.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer rounded-xl p-1 md:p-2 transition-all duration-200 ${localActiveFilters.transmission === item.label ? 'bg-amber-900/30 border border-amber-500/40' : 'hover:bg-gray-800/50'}`}
                onClick={() => handleTransmissionSelect(item.label)}
              >
                <img src={item.icon} alt={item.label} className="h-10 md:h-12 lg:h-14 mb-2 md:mb-4 lg:mb-5" />
                <span className="font-bruno text-xs md:text-sm">{item.label}</span>
                {localActiveFilters.transmission === item.label && (
                  <div className="mt-1 bg-amber-500 rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                    <Check size={10} className="text-black md:w-3 md:h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div >

      {/* Apply Filters Button - Sticky on Mobile */}
      < div className="sticky bottom-0 bg-[#090909] pt-4 pb-2 lg:static lg:bg-transparent lg:pt-0 lg:pb-0" >
        <Button
          onClick={applyAllFilters}
          className="w-full py-3 md:py-4 lg:py-5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-600 text-black font-semibold rounded-xl border border-amber-300/20 shadow-lg transition-all duration-300 hover:shadow-amber-500/20 hover:scale-[1.01] text-sm md:text-base"
        >
          <Filter size={16} className="mr-2 md:hidden" />
          Apply Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-black/20 px-2 py-1 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div >
    </aside >
  );
}