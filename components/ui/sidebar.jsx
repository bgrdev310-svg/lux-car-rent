"use client";
import React, { useState, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, Home, Car, Users, FileText, HelpCircle, Shield, Info, LogOut, ChevronRight, Crown } from "lucide-react";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useAdminUser } from "@/app/admin/AdminUserProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = memo(({ href, label, icon: Icon, onClick, active }) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 overflow-hidden",
      "hover:bg-white/5",
      active ? "bg-white/5 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : "border border-transparent"
    )}
  >
    {/* Active Indicator Line */}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
    )}

    {/* Hover Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />

    <div className={cn(
      "relative z-10 p-2 rounded-lg transition-colors duration-300",
      active ? "bg-yellow-500/10 text-yellow-500" : "bg-black/40 text-gray-500 group-hover:text-yellow-400 group-hover:bg-yellow-500/5"
    )}>
      <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", active && "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]")} />
    </div>

    <span className={cn(
      "relative z-10 font-bruno text-sm tracking-widest uppercase transition-colors duration-300",
      active ? "text-white" : "text-gray-400 group-hover:text-white"
    )}>
      {label}
    </span>

    {active && (
      <ChevronRight className="absolute right-3 text-yellow-500/50 animate-pulse" size={16} />
    )}
  </Link>
));
NavItem.displayName = "NavItem";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, handleLogout } = useAdminUser() || {}; // Use hook and retrieve user/logout
  const { canAccessHome, canAccessRoles } = usePermissions();
  const pathname = usePathname();
  const router = useRouter(); // Use router for navigation

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Trigger - High Visibility */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-[9999] bg-black border border-yellow-500/50 text-yellow-500 p-3 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] backdrop-blur-md active:scale-95 transition-all hover:bg-yellow-500/10"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X size={24} /> : <Crown size={24} className="fill-yellow-500 text-yellow-500" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen z-40 w-[280px] lg:w-64",
          "bg-[#050505] border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]",
          "flex flex-col transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)",
          "lg:rounded-r-[40px] lg:ml-0 lg:my-0 lg:h-screen", // Removed lg:my-4 lg:ml-4 lg:h-[calc(100vh-32px)] for flush design
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Decorative Ambience */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-50%] w-[300px] h-[300px] bg-yellow-600/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-20%] w-[200px] h-[200px] bg-purple-900/5 rounded-full blur-[80px]" />
        </div>

        {/* Header */}
        <div className="relative z-10 px-6 pt-10 pb-8 border-b border-white/5 text-center overflow-hidden">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <Crown size={28} className="text-yellow-500 fill-yellow-500/10" />
          </div>
          <h2 className="text-2xl font-bruno text-white tracking-[0.1em] truncate w-full">
            LUX <span className="text-yellow-500">ADMIN</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-sans tracking-widest mt-1 uppercase truncate">Control Center</p>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-8 space-y-2 custom-scrollbar">

          <div className="px-4 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-bruno">Analytics</div>
          <NavItem href="/admin/dashboard" label="Dashboard" icon={LayoutDashboard} active={pathname === "/admin/dashboard"} onClick={closeSidebar} />

          <div className="px-4 mt-8 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-bruno">Content</div>

          {/* Always show Home Page link as requested */}
          <NavItem href="/admin/hp" label="Home Page" icon={Home} active={pathname === "/admin/hp"} onClick={closeSidebar} />

          <NavItem href="/admin/aboutus" label="About Us" icon={Info} active={pathname === "/admin/aboutus"} onClick={closeSidebar} />
          <NavItem href="/admin/cars" label="Fleet" icon={Car} active={pathname === "/admin/cars"} onClick={closeSidebar} />
          <NavItem href="/admin/contactpannel" label="Contacts" icon={Users} active={pathname === "/admin/contactpannel"} onClick={closeSidebar} />
          <NavItem href="/admin/req" label="Requests" icon={FileText} active={pathname === "/admin/req"} onClick={closeSidebar} />
          <NavItem href="/admin/faaq" label="F.A.Q" icon={HelpCircle} active={pathname === "/admin/faaq"} onClick={closeSidebar} />

          {canAccessRoles && (
            <>
              <div className="px-4 mt-8 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest font-bruno">System</div>
              <NavItem href="/admin/ro" label="Roles & Perms" icon={Shield} active={pathname === "/admin/ro"} onClick={closeSidebar} />
            </>
          )}
        </nav>

        {/* Footer / Profile */}
        <div className="relative z-10 p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="relative">
            {/* Profile Button / Trigger */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full group relative bg-[#0a0a0a] border border-white/5 rounded-xl p-4 transition-all hover:bg-white/5 cursor-pointer overflow-hidden flex items-center gap-3 text-left focus:outline-none focus:border-yellow-500/30"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-700 p-[1px] shrink-0">
                <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                  <span className="font-bruno text-yellow-500 text-xs">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'NL'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase font-bold text-white tracking-wider truncate">
                  {user && user.name ? user.name : (user && user.username ? user.username : "Noble Lux Rent")}
                </div>
                <div className="text-[10px] text-gray-500 truncate font-mono">
                  {/* Phone number priority, no email */}
                  {user && user.phone ? user.phone : (user && user.role ? user.role : "Admin Console")}
                </div>
              </div>
              {/* Rotate chevron based on open state */}
              <ChevronRight size={16} className={cn("text-gray-500 group-hover:text-yellow-500 transition-all duration-300", isProfileOpen && "-rotate-90 text-yellow-500")} />
            </button>

            {/* Popup Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 w-full mb-3 bg-[#111] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 p-1"
                >
                  <div
                    onClick={() => router.push('/hpp')}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-bold tracking-wider"
                  >
                    <Home size={14} className="text-yellow-500" />
                    Return to Web
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-xs uppercase font-bold tracking-wider"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside >
    </>
  );
}
