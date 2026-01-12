"use client"
import { getApiUrl } from '@/lib/api-config';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/app/components/homepage/navbar";
import FooterSection from "@/app/components/homepage/footer";
import GalleryModal from "@/components/ui/gallery";
import { CalendarIcon, MessageSquare, PhoneCall, Check, ChevronLeft, ChevronRight, X, Send } from "lucide-react";
import { decodeJWT } from "@/lib/utils";
import { motion } from "framer-motion";

// For demo purposes, we'll simulate the service call
// In your actual implementation, uncomment the line below:
import { submitRentalRequest } from "@/app/components/data/requestService";


const BookingModal = React.memo(({
    showBookingModal,
    setShowBookingModal,
    submitSuccess,
    handleSubmitBooking,
    car,
    startDate,
    endDate,
    calculateDays,
    rentalOption,
    calculatePrice,
    formatDisplayDate,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerMessage,
    setCustomerMessage,
    isSubmitting
}) => {
    // Compose car name as 'brand + model' if available
    const carName = car?.brand && car?.model ? `${car.brand} ${car.model}` : car?.title || '';
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0a] border border-[#FFD700]/20 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(255,215,0,0.1)]">
                {submitSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFD700]/20">
                            <Check size={40} className="text-black" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2 font-bruno">Request Submitted!</h3>
                        <p className="text-gray-300 mb-6 font-sans">We'll contact you within 24 hours to confirm your booking.</p>
                        <p className="text-sm text-yellow-500/80 animate-pulse">Closing automatically...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitBooking}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-white font-bruno">Complete Your Booking</h3>
                            <button
                                type="button"
                                onClick={() => setShowBookingModal(false)}
                                className="text-gray-400 hover:text-[#FFD700] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Booking Summary */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8">
                            <h4 className="font-bold text-[#FFD700] mb-4 uppercase tracking-wider text-xs font-bruno">Booking Summary</h4>
                            <div className="space-y-3 text-sm text-gray-300 font-sans">
                                <div className="flex justify-between border-b border-white/5 pb-2"><span>Car</span> <span className="text-white font-medium">{carName}</span></div>
                                <div className="flex justify-between border-b border-white/5 pb-2"><span>Dates</span> <span className="text-white font-medium">{formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</span></div>
                                <div className="flex justify-between border-b border-white/5 pb-2"><span>Duration</span> <span className="text-white font-medium">{calculateDays()} days</span></div>
                                <div className="flex justify-between border-b border-white/5 pb-2"><span>Rental Type</span> <span className="text-white capitalize font-medium">{rentalOption}</span></div>
                                <div className="flex justify-between pt-1"><span>Total</span> <span className="text-[#FFD700] font-bold text-lg font-bruno">{calculatePrice()}</span></div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all"
                                    placeholder="Enter your full name"
                                    required
                                    autoComplete="name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all"
                                    placeholder="+971 50 123 4567"
                                    required
                                    autoComplete="tel"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                    Additional Message
                                </label>
                                <textarea
                                    value={customerMessage}
                                    onChange={(e) => setCustomerMessage(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all resize-none"
                                    placeholder="Any special requests or questions..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-8">
                            <button
                                type="button"
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] py-4 px-6 bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#B8860B] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bruno transform hover:-translate-y-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
});


export default function CarDetailsClient({ id }) {
    const carId = id;
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGallery, setShowGallery] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [rentalOption, setRentalOption] = useState("daily");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showFaq, setShowFaq] = useState({});
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [logoData, setLogoData] = useState(null);
    // Booking form states
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerMessage, setCustomerMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await fetch(getApiUrl('/api/logo'));
                if (res.ok) {
                    const data = await res.json();
                    setLogoData(data);
                }
            } catch (error) {
                console.error('Failed to fetch logo:', error);
            }
        };
        fetchLogo();
    }, []);

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
                // ignore
            }
        };
        fetchFavorites();
    }, []);

    const toggleFavorite = async (carId) => {
        try {
            const res = await fetch(getApiUrl('/api/favorites'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ carId }),
            });
            if (!res.ok) {
                return;
            }
            const data = await res.json();
            const ids = new Set((data.favorites || []).map((c) => c._id || c.id));
            setFavoriteIds(ids);
        } catch (e) {
            // ignore
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${car?.brand} ${car?.model} - Noble Car Rental`,
                    text: `Check out this amazing ${car?.brand} ${car?.model} available for rent!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (error) {
                console.log('Error copying to clipboard:', error);
            }
        }
    };

    useEffect(() => {
        if (!carId) return;
        const fetchCar = async () => {
            try {
                setLoading(true);
                const res = await fetch(getApiUrl(`/api/cars/${carId}`));
                if (!res.ok) throw new Error("Car not found");
                const data = await res.json();
                setCar(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [carId]);

    const toggleFaq = (idx) => {
        setShowFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleBookNow = (e) => {
        e.preventDefault();
        setShowBookingModal(true);
    };

    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const carName = car?.brand && car?.model ? `${car.brand} ${car.model}` : car?.title || '';

        let userId = null;
        let userPhone = null;
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const user = decodeJWT(token);
            userId = user?.id || null;
            userPhone = user?.phone || null;
        }

        const requestData = {
            name: customerName,
            contact: customerPhone,
            car: carName,
            carId: car?._id,
            dateFrom: startDate,
            dateTo: endDate,
            totalDays: calculateDays(),
            rentalType: rentalOption,
            totalPrice: calculatePriceRaw(),
            message: customerMessage,
            status: "pending",
            urgent: false,
            userId,
            userPhone,
        };

        const result = await submitRentalRequest(requestData);

        setIsSubmitting(false);

        if (result.success) {
            setSubmitSuccess(true);
            setTimeout(() => {
                setShowBookingModal(false);
                setSubmitSuccess(false);
            }, 3000);
        } else {
            alert("Failed to submit request: " + (result.error || "Unknown error"));
        }
    };

    function createDateOnly(year, month, date) {
        const d = new Date();
        d.setFullYear(year, month, date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function getTodayDate() {
        const today = new Date();
        return createDateOnly(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function formatDateToString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDisplayDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function changeMonth(amount) {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + amount);
        setCurrentMonth(newMonth);
    }

    function isDateInRange(date, start, end) {
        if (!start || !end) return false;
        const checkDate = new Date(date + 'T00:00:00');
        const startDateObj = new Date(start + 'T00:00:00');
        const endDateObj = new Date(end + 'T00:00:00');
        return checkDate > startDateObj && checkDate < endDateObj;
    }

    function isDateAvailable(date) {
        // Block out unavailable dates from car.unavailableDates
        if (car?.unavailableDates && Array.isArray(car.unavailableDates)) {
            for (const range of car.unavailableDates) {
                if (range.from && range.to) {
                    const from = new Date(range.from.length > 10 ? range.from.slice(0, 10) : range.from + 'T00:00:00');
                    const to = new Date(range.to.length > 10 ? range.to.slice(0, 10) : range.to + 'T00:00:00');
                    if (date >= from && date <= to) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function isDateSelectable(date) {
        const today = getTodayDate();
        const checkDate = createDateOnly(date.getFullYear(), date.getMonth(), date.getDate());
        if (checkDate < today) return false;
        if (!isDateAvailable(checkDate)) return false;
        if (selectedCalendar === 'start') {
            return true;
        }
        if (selectedCalendar === 'end' && startDate) {
            const startDateObj = new Date(startDate + 'T00:00:00');
            return checkDate > startDateObj;
        }
        return true;
    }

    function handleDateSelect(date, type) {
        const cleanDate = createDateOnly(date.getFullYear(), date.getMonth(), date.getDate());
        const dateStr = formatDateToString(cleanDate);
        if (type === 'start') {
            setStartDate(dateStr);
            if (endDate && new Date(endDate + 'T00:00:00') < cleanDate) {
                setEndDate("");
            }
            setShowStartCalendar(false);
            setShowEndCalendar(true);
            setSelectedCalendar('end');
        } else if (type === 'end') {
            setEndDate(dateStr);
            setShowEndCalendar(false);
            setSelectedCalendar(null);
        }
    }

    function renderCalendar() {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
        const days = [];
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayNamesRow = (
            <div className="grid grid-cols-7 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-gray-500 font-bold uppercase tracking-wide py-1">{day}</div>
                ))}
            </div>
        );
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }
        for (let day = 1; day <= monthEnd.getDate(); day++) {
            const currentDate = createDateOnly(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = formatDateToString(currentDate);
            const isSelected = dateStr === (selectedCalendar === 'start' ? startDate : endDate);
            const inSelectedRange = startDate && endDate ? isDateInRange(dateStr, startDate, endDate) : false;
            const isAvailable = isDateAvailable(currentDate);
            const isSelectable = isDateSelectable(currentDate);
            const isToday = dateStr === formatDateToString(getTodayDate());
            let cellClasses = "p-2 text-center rounded-full mx-auto w-9 h-9 flex items-center justify-center text-sm transition-all duration-200 ";
            if (!isAvailable) {
                cellClasses += "line-through text-red-500/50 cursor-not-allowed ";
            } else if (isSelected) {
                cellClasses += "bg-[#FFD700] text-black font-bold shadow-lg shadow-yellow-500/30 scale-110 z-10 ";
            } else if (inSelectedRange) {
                cellClasses += "bg-[#FFD700]/20 text-[#FFD700] ";
            } else if (isSelectable) {
                cellClasses += "hover:bg-[#FFD700] hover:text-black cursor-pointer text-gray-300 ";
            } else {
                cellClasses += "text-zinc-600 cursor-not-allowed ";
            }
            if (isToday && !isSelected) {
                cellClasses += "ring-1 ring-[#FFD700] text-[#FFD700] ";
            }
            days.push(
                <div
                    key={day}
                    className={cellClasses}
                    onClick={() => {
                        if (isSelectable) {
                            handleDateSelect(currentDate, selectedCalendar);
                        }
                    }}
                >
                    {day}
                </div>
            );
        }
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(
                <div key={`week-${i}`} className="grid grid-cols-7 gap-1 mb-1">
                    {days.slice(i, i + 7)}
                </div>
            );
        }
        return (
            <div className="bg-[#0a0a0a] rounded-2xl p-6 shadow-2xl border border-[#FFD700]/20 w-full max-w-sm absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <button
                        onClick={(e) => { e.preventDefault(); changeMonth(-1); }}
                        type="button"
                        className="p-1 rounded-full hover:bg-white/5 hover:text-[#FFD700] transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-bruno text-[#FFD700] text-lg">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                        onClick={(e) => { e.preventDefault(); changeMonth(1); }}
                        type="button"
                        className="p-1 rounded-full hover:bg-white/5 hover:text-[#FFD700] transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                {dayNamesRow}
                {weeks}
                <div className="mt-6 flex flex-wrap gap-4 text-xs justify-center pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        <span className="text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FFD700]"></div>
                        <span className="text-gray-400">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-[#FFD700]"></div>
                        <span className="text-gray-400">Today</span>
                    </div>
                </div>
            </div>
        );
    }

    function calculatePrice() {
        if (!startDate || !endDate) return "Select dates";
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "Invalid date range";
        let price;
        if (rentalOption === "daily") {
            price = diffDays * parseInt(car?.pricing?.daily || 0);
        } else if (rentalOption === "weekly") {
            const weeks = Math.ceil(diffDays / 7);
            price = weeks * parseInt(car?.pricing?.weekly || 0);
        } else {
            const months = Math.ceil(diffDays / 30);
            price = months * parseInt(car?.pricing?.monthly || 0);
        }
        return price ? `AED ${price.toLocaleString()}` : 'N/A';
    }

    function calculateDays() {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    function calculatePriceRaw() {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 0;
        let price = 0;
        if (rentalOption === "daily") {
            price = diffDays * parseInt(car?.pricing?.daily || 0);
        } else if (rentalOption === "weekly") {
            const weeks = Math.ceil(diffDays / 7);
            price = weeks * parseInt(car?.pricing?.weekly || 0);
        } else {
            const months = Math.ceil(diffDays / 30);
            price = months * parseInt(car?.pricing?.monthly || 0);
        }
        return price;
    }

    function getNearestAvailableDate() {
        const today = getTodayDate();
        let date = new Date(today);
        for (let i = 0; i < 730; i++) {
            const dateStr = formatDateToString(date);
            if (isDateAvailable(date)) {
                return new Date(date);
            }
            date.setDate(date.getDate() + 1);
        }
        return null;
    }

    if (loading) return (
        <div className="bg-[#050505] min-h-screen flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-[#FFD700] border-t-transparent rounded-full mx-auto mb-8 shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                />
                <h2 className="text-4xl font-bold text-white mb-4 font-bruno tracking-wide">Loading Luxury</h2>
                <p className="text-gray-500 text-lg font-light tracking-widest uppercase">Preparing your experience...</p>
            </div>
        </div>
    );
    if (error) return <div className="bg-[#050505] min-h-screen flex items-center justify-center text-red-500 text-xl font-bruno">Error: {error}</div>;
    if (!car) return <div className="bg-[#050505] min-h-screen flex items-center justify-center text-white text-xl font-bruno">Vehicle not found.</div>;

    const carSpecs = [
        { label: "Engine", value: car.specs?.find(s => s.icon?.includes('engine'))?.label || car.specs?.[0]?.label },
        { label: "Power", value: car.specs?.find(s => s.icon?.includes('horse'))?.label ? `${car.specs.find(s => s.icon?.includes('horse')).label} HP` : (car.specs?.[1]?.label ? `${car.specs[1].label} HP` : null) },
        { label: "Year", value: car.year },
        { label: "Transmission", value: car.transmission },
        { label: "Top Speed", value: car.topspeed ? `${car.topspeed} km/h` : null },
        { label: "Capacity", value: car.specs?.find(s => s.icon?.includes('fuel'))?.label || car.specs?.[2]?.label },
        { label: "Drive", value: car.drive },
        { label: "Seats", value: car.seats }
    ].filter(spec => spec.value);

    return (
        <div className="bg-[#050505] text-white min-h-screen font-sans relative selection:bg-[#FFD700] selection:text-black">
            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

            {/* Header */}
            <Navbar />

            <main className="max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
                {/* Car Title and Availability */}
                <div className="mb-10 mt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={car?.logo}
                                alt={car?.brand}
                                style={{ height: "56px", width: "auto" }}
                                className="rounded-xl bg-white/5 p-2 backdrop-blur-sm border border-white/10"
                            />
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bruno text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-sm">
                                {car?.brand} <span className="text-[#FFD700]">{car?.model}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="inline-flex items-center bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-[#00ff88] mr-3 shadow-[0_0_10px_#00ff88]"></div>
                        {(() => {
                            const nearest = getNearestAvailableDate();
                            return nearest ? (
                                <span className="text-[#00ff88] font-medium tracking-wide text-sm font-mono uppercase">
                                    Available from {formatDisplayDate(formatDateToString(nearest))}
                                </span>
                            ) : (
                                <span className="text-red-400 font-medium tracking-wide text-sm font-mono uppercase">Currently Unavailable</span>
                            );
                        })()}
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="relative mb-16 isolate z-0 overflow-hidden rounded-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[500px]">
                        {/* Main Image */}
                        <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl aspect-[4/3] md:aspect-auto md:h-full bg-[#050505] group">
                            <img
                                src={car?.mainImage || (car?.galleryImages && car.galleryImages[0])}
                                alt={car?.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        </div>

                        {/* Side Images */}
                        <div className="grid grid-cols-2 md:grid-rows-2 gap-4 md:h-full">
                            {(car?.galleryImages || []).slice(0, 2).map((img, idx) => (
                                <div key={idx} className="relative overflow-hidden rounded-3xl border border-white/5 aspect-[4/3] md:aspect-auto md:h-full bg-[#050505] group">
                                    <img
                                        src={img}
                                        alt={`${car?.title} view ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex items-center gap-3 z-10">
                        <button
                            className="bg-black/40 backdrop-blur-md border border-white/10 hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-300 text-white font-bruno py-3 px-6 rounded-2xl flex items-center gap-2 uppercase tracking-wider text-sm shadow-xl"
                            onClick={() => setShowGallery(true)}
                        >
                            <div className="w-2 h-2 bg-current rounded-full"></div>
                            View Gallery
                        </button>
                    </div>

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                        <button
                            title="Toggle favorite"
                            aria-pressed={favoriteIds.has(car?._id)}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(car?._id); }}
                            className={`p-4 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 shadow-xl ${favoriteIds.has(car?._id)
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/30'
                                : 'bg-black/40 hover:bg-white/10 text-white hover:border-white/30'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
                                <path
                                    d="M12 21s-6.716-4.238-9.193-6.716C.804 12.28.5 9.5 2.343 7.657a5 5 0 017.071 0L12 10.243l2.586-2.586a5 5 0 017.071 7.071C18.716 16.762 12 21 12 21z"
                                    className={favoriteIds.has(car?._id) ? 'fill-current' : 'fill-transparent'}
                                    strokeWidth="2"
                                    stroke="currentColor"
                                />
                            </svg>
                        </button>

                        <button
                            title="Share this car"
                            onClick={handleShare}
                            className="p-4 rounded-full bg-black/40 hover:bg-white/10 text-white border border-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-md shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                            </svg>
                        </button>
                    </div>

                    <GalleryModal
                        isOpen={showGallery}
                        onClose={() => setShowGallery(false)}
                        images={[car?.mainImage, ...(car?.galleryImages || [])].filter(Boolean)}
                        videos={car?.galleryVideos || []}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10 transition-all">
                    {/* Left Column: Car Details */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Car Description */}
                        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-1 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]"></div>
                                <h2 className="text-3xl md:text-4xl font-bruno text-white uppercase tracking-wider">About This Car</h2>
                            </div>

                            {/* Mobile Actions Overlay */}
                            <div className="md:hidden flex gap-3 mb-6">
                                {/* Replicated actions for mobile if needed, but sticky functionality usually covers it */}
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
                                <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed font-sans">
                                    {car?.description || 'No description available for this exclusive vehicle.'}
                                </p>
                            </div>
                        </section>

                        {/* Car Specs */}
                        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-1 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]"></div>
                                <h2 className="text-3xl md:text-4xl font-bruno text-white uppercase tracking-wider">Specifications</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {carSpecs.map((spec, idx) => (
                                    <div key={idx} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="text-[#FFD700] text-xs uppercase tracking-[0.2em] mb-2 opacity-80">{spec.label}</div>
                                        <div className="font-bruno text-xl md:text-2xl text-white group-hover:text-[#FFD700] transition-colors">{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-1 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]"></div>
                                <h2 className="text-3xl md:text-4xl font-bruno text-white uppercase tracking-wider">Rental Requirements</h2>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:border-[#FFD700]/20 transition-colors">
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                    {(car?.rentalRequirements && car.rentalRequirements.length > 0
                                        ? car.rentalRequirements
                                        : [
                                            "Minimum 21 years old",
                                            "Valid UAE Driving License or International Driving Permit",
                                            "Passport or Emirates ID",
                                            "Security Deposit (10,000 AED via credit card)",
                                            "Clean driving record"
                                        ]
                                    ).map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                            <div className="bg-[#FFD700]/10 p-2 rounded-full text-[#FFD700]">
                                                <Check size={18} />
                                            </div>
                                            <span className="font-sans text-gray-300 pt-1">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* FAQs */}
                        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-400">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-1 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]"></div>
                                <h2 className="text-3xl md:text-4xl font-bruno text-white uppercase tracking-wider">Frequently Asked Questions</h2>
                            </div>
                            <div className="space-y-4">
                                {car?.faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className="group bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-[#FFD700]/30 transition-all duration-300"
                                    >
                                        <button
                                            className="w-full text-left p-6 flex justify-between items-center"
                                            onClick={() => toggleFaq(idx)}
                                        >
                                            <span className="font-sans font-medium text-lg text-white group-hover:text-[#FFD700] transition-colors">{faq.question}</span>
                                            <span className={`text-[#FFD700] text-2xl transition-transform duration-300 ${showFaq[idx] ? 'rotate-45' : ''}`}>+</span>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFaq[idx] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="p-6 pt-0 text-gray-400 font-sans border-t border-white/5 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Booking Form */}
                    <div className="lg:col-span-1 relative z-20">
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sticky top-28 shadow-2xl shadow-black/50">
                            {/* Agency Logo */}
                            <div className="flex flex-col items-center justify-center mb-8 pb-8 border-b border-white/10">
                                <Image
                                    src={logoData?.navbarLogo || "/img/noblelogo.png"}
                                    alt={logoData?.companyName || "Noble Road Luxury Car Rental"}
                                    width={140}
                                    height={80}
                                    className="mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                                />
                                <div className="text-center">
                                    <h3 className="font-bruno text-xl text-white tracking-widest uppercase">{logoData?.companyName || "Noble Road"}</h3>
                                    <p className="text-xs text-[#FFD700] tracking-[0.3em] uppercase mt-1">Luxury Car Rental</p>
                                </div>
                            </div>

                            {/* Pricing Options */}
                            <div className="grid grid-cols-3 gap-2 mb-8 bg-black/40 p-1 rounded-2xl border border-white/5">
                                {[
                                    { id: "daily", label: "Daily", price: car?.pricing?.daily },
                                    { id: "weekly", label: "Weekly", price: car?.pricing?.weekly },
                                    { id: "monthly", label: "Monthly", price: car?.pricing?.monthly }
                                ].map(option => (
                                    <button
                                        key={option.id}
                                        className={`p-3 text-center rounded-xl transition-all duration-300 ${rentalOption === option.id
                                            ? "bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20 scale-105 font-bold"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                        onClick={() => setRentalOption(option.id)}
                                    >
                                        <div className="text-[10px] uppercase tracking-wider mb-1 opacity-80">{option.label}</div>
                                        <div className="font-bruno text-sm whitespace-nowrap">{option.price ? <><span className={`text-[10px] mr-1 ${rentalOption === option.id ? "text-black/60" : "text-gray-400"}`}>AED</span>{option.price}</> : 'N/A'}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Booking Form */}
                            <form className="space-y-5">
                                <div className="space-y-2 relative" id="start-calendar-container">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Pick-up Date</label>
                                    <div
                                        className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#FFD700]/50 hover:bg-white/[0.05] transition-all flex justify-between items-center cursor-pointer group"
                                        onClick={() => {
                                            setShowStartCalendar(!showStartCalendar);
                                            setShowEndCalendar(false);
                                            setSelectedCalendar('start');
                                            setCurrentMonth(new Date());
                                        }}
                                    >
                                        <span className={`font-medium ${startDate ? "text-[#FFD700]" : "text-gray-500 group-hover:text-gray-300"}`}>
                                            {startDate ? formatDisplayDate(startDate) : "Select Date"}
                                        </span>
                                        <CalendarIcon className={`group-hover:text-[#FFD700] transition-colors ${startDate ? "text-[#FFD700]" : "text-gray-600"}`} size={20} />
                                    </div>

                                    {showStartCalendar && renderCalendar()}
                                </div>

                                <div className="space-y-2 relative" id="end-calendar-container">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Return Date</label>
                                    <div
                                        className={`w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center transition-all ${startDate
                                            ? "cursor-pointer hover:border-[#FFD700]/50 hover:bg-white/[0.05] group"
                                            : "opacity-50 cursor-not-allowed"
                                            }`}
                                        onClick={() => {
                                            if (startDate) {
                                                setShowEndCalendar(!showEndCalendar);
                                                setShowStartCalendar(false);
                                                setSelectedCalendar('end');
                                                setCurrentMonth(new Date(startDate));
                                            }
                                        }}
                                    >
                                        <span className={`font-medium ${endDate ? "text-[#FFD700]" : "text-gray-500 group-hover:text-gray-300"}`}>
                                            {endDate ? formatDisplayDate(endDate) : "Select Date"}
                                        </span>
                                        <CalendarIcon className={`group-hover:text-[#FFD700] transition-colors ${endDate ? "text-[#FFD700]" : "text-gray-600"}`} size={20} />
                                    </div>

                                    {showEndCalendar && renderCalendar()}
                                </div>

                                {/* Rental Inclusions */}
                                <div className="bg-[#FFD700]/5 border border-[#FFD700]/10 rounded-2xl p-5 space-y-3 mt-6">
                                    <h4 className="font-bold text-[#FFD700] text-xs uppercase tracking-widest mb-2 border-b border-[#FFD700]/10 pb-2">Included Premium Services</h4>
                                    <ul className="space-y-2 text-xs">
                                        {(car?.features && car.features.length > 0
                                            ? car.features
                                            : [
                                                "300km daily mileage limit",
                                                "Free Luxury Delivery & Pickup (Dubai)",
                                                "24/7 VIP Roadside Assistance"
                                            ]
                                        ).map((feature, idx) => (
                                            <li key={idx} className="flex items-start text-gray-300">
                                                <Check className="text-[#00ff88] mr-2 mt-0.5 flex-shrink-0" size={14} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Total Price Calculation */}
                                {startDate && endDate && (
                                    <div className="bg-gradient-to-r from-zinc-900 to-black border border-[#FFD700]/20 p-5 rounded-2xl shadow-inner">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm font-light">Total Estimated Cost</span>
                                            <span className="font-bruno text-2xl text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">{calculatePrice()}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4">
                                    <a
                                        href={car?.phone ? `https://wa.me/${car.phone.replace(/[^0-9]/g, '')}` : "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group bg-[#25D366] hover:bg-[#128C7E] text-white font-bruno flex items-center justify-center gap-3 w-full py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-0.5"
                                    >
                                        <MessageSquare size={20} className="fill-white" />
                                        <span className="tracking-wider text-sm">WHATSAPP INQUIRY</span>
                                    </a>

                                    <a
                                        href={car?.phone ? `tel:${car.phone.replace(/[^0-9]/g, '')}` : "#"}
                                        className="group bg-[#FFD700] hover:bg-[#FDB931] text-black font-bruno flex items-center justify-center gap-3 w-full py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(255,215,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,215,0,0.23)] hover:-translate-y-0.5"
                                    >
                                        <PhoneCall size={20} />
                                        <span className="tracking-wider text-sm">{car?.phone || "+971 50 123 4567"}</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={handleBookNow}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#B8860B] text-black font-bruno font-bold tracking-widest hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            BOOK NOW <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
                                    </button>
                                </div>
                            </form>

                            {/* Location */}
                            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                <h4 className="font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">Luxury Pickup Location</h4>
                                <address className="not-italic text-gray-300 text-xs leading-relaxed opacity-70 hover:opacity-100 transition-opacity">
                                    Sheikh Zayed Road, Al Wasl Business Center<br />
                                    Office 302, Dubai, United Arab Emirates
                                </address>
                            </div>
                        </div>
                    </div>
                </div>
            </main>


            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    showBookingModal={showBookingModal}
                    setShowBookingModal={setShowBookingModal}
                    submitSuccess={submitSuccess}
                    handleSubmitBooking={handleSubmitBooking}
                    car={car}
                    startDate={startDate}
                    endDate={endDate}
                    calculateDays={calculateDays}
                    rentalOption={rentalOption}
                    calculatePrice={calculatePrice}
                    formatDisplayDate={formatDisplayDate}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerPhone={customerPhone}
                    setCustomerPhone={setCustomerPhone}
                    customerMessage={customerMessage}
                    setCustomerMessage={setCustomerMessage}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Footer */}
            <FooterSection />
        </div>
    );


}
