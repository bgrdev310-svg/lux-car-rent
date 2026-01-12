"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { decodeJWT } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

export const AdminUserContext = createContext(null);

export function AdminUserProvider({ user: initialUser, children }) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Note: Navbar fetches /api/auth/me directly without pre-checking token.
    // We should do the same to support HttpOnly cookies where document.cookie is empty.

    // Attempt to read token for optimistic/fallback use, but don't block fetch
    let clientToken = null;
    if (typeof window !== 'undefined') {
      clientToken = localStorage.getItem('token');
      if (!clientToken) {
        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        if (match) clientToken = match[2];
      }
    }

    // Always fetch profile
    fetch(getApiUrl('/api/auth/me'), {
      credentials: 'include', // Sends HttpOnly cookies
      headers: clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {}
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            return;
          }
        }

        // As a fallback, if API failed but we have a valid client token, decode it
        if (clientToken) {
          const decoded = decodeJWT(clientToken);
          if (decoded && (!decoded.exp || Date.now() < decoded.exp * 1000)) {
            setUser(decoded);
            return;
          }
        }

        // If both failed, logout
        handleLogout();
      })
      .catch(err => {
        console.error("Auth check failed:", err);
        // Fallback to client token if network error
        if (clientToken) {
          const decoded = decodeJWT(clientToken);
          if (decoded) {
            setUser(decoded);
            return;
          }
        }
        handleLogout();
      });

  }, [pathname]);

  const handleLogout = () => {
    setUser(null);
    if (pathname?.startsWith('/admin')) {
      // Optional: redirect to login
    }
  };

  return (
    <AdminUserContext.Provider value={{ user, handleLogout }}>
      {children}
    </AdminUserContext.Provider>
  );
}

// Custom hook for convenience
export function useAdminUser() {
  return useContext(AdminUserContext);
}
