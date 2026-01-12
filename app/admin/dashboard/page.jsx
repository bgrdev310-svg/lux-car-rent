'use client';

import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import TopCarsWidget from '@/components/admin/dashboard/TopCarsWidget';
import CarFleetTable from '@/components/admin/dashboard/CarFleetTable';
import Sidebar from "@/components/ui/sidebar";
import { getApiUrl } from '@/lib/api-config';
import { FaCar, FaCalendarCheck, FaMoneyBillWave, FaFilter } from 'react-icons/fa';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('all'); // 'today', 'week', 'month', 'year', 'all'

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch stats from external backend (charts, revenue, etc.)
                const statsRes = await fetch(getApiUrl(`/api/dashboard/stats?period=${period}`));
                if (!statsRes.ok) {
                    throw new Error(`Failed to fetch dashboard data: ${statsRes.status} ${statsRes.statusText}`);
                }
                const baseStats = await statsRes.json();

                // Fetch live data from our own APIs so active rentals and fleet status reflect real bookings
                const [carsRes, requestsRes] = await Promise.all([
                    fetch('/api/cars'),
                    fetch('/api/requests'),
                ]);

                const cars = carsRes.ok ? await carsRes.json() : [];
                const requests = requestsRes.ok ? await requestsRes.json() : [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Active rentals = accepted requests whose date range includes today
                const activeRequests = requests.filter((req) => {
                    if (req.status !== 'accepted') return false;
                    const from = req.dateFrom ? new Date(req.dateFrom) : null;
                    const to = req.dateTo ? new Date(req.dateTo) : null;
                    if (!from || !to) return false;
                    from.setHours(0, 0, 0, 0);
                    to.setHours(0, 0, 0, 0);
                    return today >= from && today <= to;
                });

                const bookedCarIds = new Set(
                    activeRequests
                        .map((r) => r.carId)
                        .filter(Boolean)
                        .map((id) => String(id))
                );

                const fleetStatus = cars.map((car) => {
                    const id = String(car._id);
                    const state = bookedCarIds.has(id) ? 'Booked' : 'Available';
                    const price =
                        car.pricing?.daily ??
                        car.price ??
                        0;

                    return {
                        ...car,
                        state,
                        price,
                        category: car.category || 'Luxury',
                    };
                });

                const availableCars = fleetStatus.filter((car) => car.state === 'Available').length;

                const mergedStats = {
                    ...baseStats,
                    overview: {
                        ...(baseStats.overview || {}),
                        activeRentals: activeRequests.length,
                        availableCars,
                    },
                    fleetStatus,
                };

                setStats(mergedStats);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error.message || 'Failed to fetch dashboard data. Please ensure the backend server is running.');
                setLoading(false);
                // Set default stats to prevent crashes
                setStats({
                    overview: {
                        bookingsToday: 0,
                        bookingGrowth: 0,
                        activeRentals: 0,
                        availableCars: 0,
                        totalRevenue: 0,
                        revenueGrowth: 0
                    },
                    salesChart: [],
                    topCars: [],
                    fleetStatus: [],
                    pendingBookings: []
                });
            }
        };

        fetchData();
    }, [period]);

    const handleFilterChange = (e) => {
        setPeriod(e.target.value);
    };

    if (loading && !stats) {
        return (
            <div className="flex flex-col lg:flex-row min-h-screen bg-black">
                <div className="lg:w-80 lg:flex-shrink-0 z-50">
                    <Sidebar />
                </div>
                <main className="flex-1 flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="flex-1 relative z-0 overflow-x-hidden p-4 lg:p-8 space-y-8 font-sans lg:ml-72 xl:ml-80">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                        <p className="font-semibold">Connection Error</p>
                        <p className="text-sm mt-1">{error}</p>
                        <p className="text-xs mt-2 text-red-300">Make sure the backend server is running on port 5001 and MongoDB is connected.</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-16 lg:pt-0 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-bruno text-white tracking-wider">DASHBOARD</h1>
                        <p className="text-gray-400 mt-1">Welcome back, Admin</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Filter Dropdown */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaFilter className="text-gold" />
                            </div>
                            <select
                                value={period}
                                onChange={handleFilterChange}
                                className="bg-black border border-gold/30 text-white text-sm rounded-lg focus:ring-gold focus:border-gold block w-full pl-10 p-2.5 appearance-none cursor-pointer hover:border-gold transition-colors"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        <div className="text-right hidden sm:block">
                            <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gold/20 border border-gold flex items-center justify-center text-gold font-bold">
                            A
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Bookings"
                        value={stats?.overview?.bookingsToday ?? 0}
                        icon={<FaCalendarCheck className="text-gold text-xl" />}
                        trend={stats?.overview?.bookingGrowth !== undefined ? `${stats?.overview?.bookingGrowth}%` : '0%'}
                        trendUp={stats?.overview?.bookingGrowth >= 0}
                    />
                    <StatsCard
                        title="Active Rentals"
                        value={stats?.overview?.activeRentals || 0}
                        icon={<FaCar className="text-gold text-xl" />}
                    />
                    <StatsCard
                        title="Available Cars"
                        value={stats?.overview?.availableCars || 0}
                        icon={<FaCar className="text-gold text-xl" />}
                    />
                    <StatsCard
                        title="Total Revenue"
                        value={`$${(stats?.overview?.totalRevenue ?? 0).toLocaleString()}`}
                        icon={<FaMoneyBillWave className="text-gold text-xl" />}
                        trend={stats?.overview?.revenueGrowth !== undefined ? `${stats?.overview?.revenueGrowth}%` : '0%'}
                        trendUp={stats?.overview?.revenueGrowth >= 0}
                    />
                </div>

                {/* Analytics & Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RevenueChart data={stats?.salesChart || []} />
                    </div>
                    <div>
                        <TopCarsWidget cars={stats?.topCars || []} />
                    </div>
                </div>

                {/* Fleet Table */}
                <div>
                    <CarFleetTable cars={stats?.fleetStatus || []} />
                </div>
            </main>
        </div>
    );
}
