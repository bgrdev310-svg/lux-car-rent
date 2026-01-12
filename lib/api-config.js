/**
 * Returns the full API URL for a given path.
 * Uses NEXT_PUBLIC_API_URL environment variable if set, otherwise defaults to relative path (local).
 * 
 * @param {string} path - The API path (e.g., '/api/cars')
 * @returns {string} - The full URL (e.g., 'https://backend.com/api/cars' or '/api/cars')
 */
export const getApiUrl = (path) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // If NEXT_PUBLIC_API_URL is set (e.g. 'https://my-render-app.onrender.com'), prepend it.
    // Important: The backend must allow CORS from the frontend domain.
    if (process.env.NEXT_PUBLIC_API_URL) {
        // Remove trailing slash from base URL if present
        const baseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
        return `${baseUrl}${normalizedPath}`;
    }

    // Fallback to relative path for local dev (proxy) or if same-domain hosting
    // Fix: Explicitly point to backend port 5001 if on localhost and no env var set
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return `http://127.0.0.1:5001${normalizedPath}`;
    }
    return normalizedPath;
};
