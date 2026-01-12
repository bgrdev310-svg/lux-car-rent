import React, { Suspense } from 'react';
import ClientHome from './components/homepage/client-home';
import { getApiUrl } from '@/lib/api-config';

// Force dynamic rendering since data changes frequently (unless cached with revalidate)
// Using revalidate: 3600 (1 hour) to match previous logic, or 0 for fresh data.
// Given "fastest time" request, 0 is bad for performance if DB is slow, but good for real-time.
// However, memory optimization => static/ISR is better.
// user said "fetch the data fro mongodb with fastest time", implies optimized query (already done) + fast response.
// Let's use revalidate 60s for balance.

export const revalidate = 60; // Revalidate every 60 seconds

async function getData() {
    // We can call the DB directly here for "fastest time" avoiding HTTP overhead if we want,
    // but the API route is already optimized and parallelized. 
    // Calling via HTTP is standard in App Router if logic is in API routes.
    // If backend is local, overhead is minimal.
    // However, for "best memory usage" and speed, direct DB call is slightly better but requires moving logic here.
    // Given the plan was to "Fetch data directly from the API", I will stick to that.

    // Note: getApiUrl returns client-side URL mostly. 
    // For server-side fetch to localhost:5001, we might need full URL if not handled.
    // Assuming internal API is reachable via http://localhost:5001/api/home

    // Since we are server-side, we should use the internal container/localhost URL.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';

    try {
        const res = await fetch(`${apiUrl}/api/home`, {
            next: { revalidate: 60 }
        });

        if (!res.ok) {
            console.error('Failed to fetch home data', res.status);
            return null;
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching home data:', error);
        return null;
    }
}

export default async function Home() {
    const data = await getData();

    // Pass data to Client Component
    // If data is null, ClientHome handles it gracefully (or displays loading/error state if we want)
    // The previous implementation had a "loading" state. 
    // Here we can show a lighter fallback from Suspense or just pass null.

    return (
        <ClientHome initialData={data} />
    );
}
