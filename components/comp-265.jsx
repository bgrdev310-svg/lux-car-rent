"use client"

import { useId, useEffect, useState } from "react"

import { useSliderWithInput } from "@/hooks/use-slider-with-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function PriceSlider({ onFilterChange, initialRange = [200, 780], cars = [], hideRangeDisplay = false }) {
  const id = useId()
  const [isInitialMount, setIsInitialMount] = useState(true)
  const [selectedCount, setSelectedCount] = useState(0)

  // Dynamically generate items from cars prop
  const items = (cars && cars.length > 0)
    ? cars.map((car, idx) => ({ id: car._id || car.id || idx, price: Number(car.price || car.pricing?.daily || 0) }))
    : [];

  // Get unique prices for dynamic bars
  const uniquePrices = Array.from(new Set(items.map(item => item.price))).sort((a, b) => a - b);
  const minValue = 0;
  const maxValue = 10000;

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({ minValue, maxValue, initialValue: [minValue, maxValue] })

  // Decorative histogram: taller bars for better visibility
  const decorativeHeights = [85, 130, 60, 115, 80, 140, 100, 70, 120, 95]; // heights in px
  let histogramBars = null;
  histogramBars = (
    <div className="flex h-40 w-full items-end px-1 gap-1" aria-hidden="true">
      {decorativeHeights.map((height, i) => {
        // Calculate the price range for this bar
        const barMin = minValue + i * ((maxValue - minValue) / decorativeHeights.length);
        const barMax = minValue + (i + 1) * ((maxValue - minValue) / decorativeHeights.length);
        // Is this bar inside the selected slider range?
        const inRange = barMax > sliderValue[0] && barMin < sliderValue[1];
        return (
          <div key={i} className="flex-1 flex justify-center group/bar">
            <span
              className={
                `block w-4 rounded-t-xl transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ` +
                (inRange
                  ? 'bg-gradient-to-t from-yellow-600 via-yellow-400 to-white shadow-[0_0_15px_rgba(250,204,21,0.6)] opacity-100 scale-y-100'
                  : 'bg-white/10 opacity-30 group-hover/bar:bg-white/20 scale-y-95 grayscale')
              }
              style={{ height: `${height}px` }}
            ></span>
          </div>
        );
      })}
    </div>
  );

  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Update the selected count when slider values change
  useEffect(() => {
    setSelectedCount(items.filter((item) => item.price >= sliderValue[0] && item.price <= sliderValue[1]).length);
  }, [sliderValue]);

  // Notify parent component when slider value changes
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    const handler = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange(true, sliderValue);
      }
    }, 100);
    return () => {
      clearTimeout(handler);
    };
  }, [sliderValue, onFilterChange, isInitialMount]);

  const handleSliderValueChange = (values) => {
    handleSliderChange(values);
  };

  return (
    <div className="bg-[#050505] p-6 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-radial from-yellow-500/5 to-transparent pointer-events-none" />

      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <Label className="text-white font-bruno text-xl tracking-wider uppercase drop-shadow-md">Price Range</Label>
          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            {selectedCount} ITEMS FOUND
          </span>
        </div>

        {/* Histogram bars */}
        <div className="mt-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-light">No vehicles available</div>
          ) : (
            <div className="relative">
              {histogramBars}
              {/* Custom Slider Styling - Positioned to align with bar bottom */}
              <div className="relative -mt-3 z-20 px-1">
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderValueChange}
                  min={minValue}
                  max={maxValue}
                  step={1}
                  aria-label="Price range"
                  className="relative flex items-center select-none touch-none w-full h-6 cursor-pointer"
                  data-slider="true"
                />
              </div>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="w-full space-y-2">
            <Label htmlFor={`${id}-min`} className="text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Min Price</Label>
            <div className="relative group/input">
              <Input
                id={`${id}-min`}
                className="peer w-full pl-8 pr-3 py-6 bg-[#0a0a0a] border-white/10 rounded-xl text-white font-bruno text-lg focus:border-yellow-500/50 focus:ring-0 focus:bg-[#111] transition-all placeholder:text-gray-700"
                type="text"
                inputMode="decimal"
                value={inputValues[0]}
                onChange={(e) => handleInputChange(e, 0)}
                onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    validateAndUpdateValue(inputValues[0], 0)
                  }
                }}
                aria-label="Enter minimum price" />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-yellow-600 peer-focus:text-yellow-500 font-bruno text-lg transition-colors">
                $
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center pt-6">
            <div className="w-4 h-[2px] bg-white/10"></div>
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor={`${id}-max`} className="text-[10px] uppercase tracking-widest text-gray-400 font-bold pl-1">Max Price</Label>
            <div className="relative group/input">
              <Input
                id={`${id}-max`}
                className="peer w-full pl-8 pr-3 py-6 bg-[#0a0a0a] border-white/10 rounded-xl text-white font-bruno text-lg focus:border-yellow-500/50 focus:ring-0 focus:bg-[#111] transition-all placeholder:text-gray-700"
                type="text"
                inputMode="decimal"
                value={inputValues[1]}
                onChange={(e) => handleInputChange(e, 1)}
                onBlur={() => validateAndUpdateValue(inputValues[1], 1)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    validateAndUpdateValue(inputValues[1], 1)
                  }
                }}
                aria-label="Enter maximum price" />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-yellow-600 peer-focus:text-yellow-500 font-bruno text-lg transition-colors">
                $
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={() => onFilterChange && onFilterChange(true, sliderValue)}
          className="w-full h-14 bg-[#FFD700] hover:bg-[#FFC000] text-black font-bruno uppercase tracking-widest text-sm rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300 hover:scale-[1.01] border-none mt-2"
        >
          SHOW {selectedCount} ITEMS
        </Button>
      </div>
    </div>
  );
}