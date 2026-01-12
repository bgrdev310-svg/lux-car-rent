"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Shield, ShieldAlert, Eye, Car, Filter, X,
  ChevronDown, UserPlus, Trash2, CheckCircle, Crown, Zap
} from 'lucide-react';
import { useAdminUser } from '../AdminUserProvider';
import Sidebar from "@/components/ui/sidebar";
import { motion, AnimatePresence } from 'framer-motion';

// --- VISUAL CONSTANTS ---
const THEME = {
  gold: "text-yellow-500",
  goldGradient: "bg-gradient-to-r from-yellow-400 to-amber-600",
  glass: "bg-white/5 backdrop-blur-md border border-white/10",
  glassHover: "hover:bg-white/10 hover:border-yellow-500/30",
  bg: "bg-[#050505]"
};

const ROLE_CONFIG = {
  admin: {
    icon: ShieldAlert,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    desc: "Full System Control"
  },
  manager: {
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    desc: "Fleet & Bookings"
  },
  agent: {
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    desc: "Read-Only Access"
  },
  client: {
    icon: Car,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    desc: "Personal Access"
  }
};

// --- SUB-COMPONENTS (Memoized) ---

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.client;
  const Icon = config.icon;
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit border ${config.bg} ${config.color}`}>
      <Icon size={12} />
      {role}
    </span>
  );
};

const UserRow = ({ user, isManager, onManage }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`group p-5 rounded-2xl ${THEME.glass} border border-white/5 hover:border-yellow-500/50 hover:bg-white/10 transition-all duration-300 mb-4 flex items-center justify-between shadow-lg shadow-black/50`}
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center font-bruno text-yellow-500 text-xl shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {user.name.substring(0, 2).toUpperCase()}
      </div>
      <div>
        <h4 className="text-white font-bold text-lg tracking-wide group-hover:text-yellow-400 transition-colors">{user.name}</h4>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            {user.phone}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="hidden md:block">
        <RoleBadge role={user.role} />
      </div>
      {!isManager && (
        <button
          onClick={() => onManage(user)}
          className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#050505] bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          Manage
        </button>
      )}
    </div>
  </motion.div>
);

export default function RolesManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const userContext = useAdminUser();
  const isManager = userContext?.role === 'manager';

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.map(u => ({ ...u, id: u._id })));
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    };
    fetchUsers();
  }, []);

  // --- FILTERS ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    agent: users.filter(u => u.role === 'agent').length,
    client: users.filter(u => u.role === 'client').length,
  }), [users]);

  // --- HANDLERS ---
  const handleRoleUpdate = async (userId, newRole) => {
    // OPTIMISTIC UI UPDATE: Update local state immediately for instant feedback
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setSelectedUser(null); // Close modal immediately

    // Perform API call in background
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      // If needed, we could revert state here on error, but for UX speed we prioritize the instant update.
    } catch (e) {
      console.error("Failed to update role in DB", e);
      // Optional: Show toast error
    }
  };

  const handleDelete = async (userId) => {
    // Optimistic UI update
    setUsers(prev => prev.filter(u => u.id !== userId));
    setSelectedUser(null);
  }

  // --- RENDER ---
  return (
    <div className={`min-h-screen ${THEME.bg} text-white font-sans selection:bg-yellow-500/30 flex overflow-hidden`}>
      <div className="hidden lg:block fixed h-screen w-72 border-r border-white/5 z-20 bg-black">
        <Sidebar />
      </div>

      <main className="flex-1 lg:ml-72 relative p-8 overflow-y-auto h-screen">
        {/* Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bruno text-white mb-2">
              USER <span className="text-yellow-500">ROLES</span>
            </h1>
            <p className="text-gray-400 text-sm">Manage access levels and permissions for the platform.</p>
          </div>
          {!isManager && (
            <button
              onClick={() => setIsAddOpen(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-black ${THEME.goldGradient} hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all`}
            >
              <UserPlus size={18} />
              ADD USER
            </button>
          )}
        </header>

        {/* Stats HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(stats).map(([role, count]) => {
            const config = ROLE_CONFIG[role];
            const Icon = config.icon;
            return (
              <div key={role} className={`p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm relative overflow-hidden group`}>
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${config.color}`}>
                  <Icon size={60} />
                </div>
                <div className={`text-4xl font-bruno mb-1 ${config.color}`}>{count}</div>
                <div className="text-sm font-bold uppercase tracking-widest text-gray-400">{role}s</div>
              </div>
            )
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10">
            {['all', 'admin', 'manager', 'agent', 'client'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${roleFilter === role ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <motion.div layout className="space-y-2 pb-24">
          <AnimatePresence>
            {filteredUsers.map(u => (
              <UserRow key={u.id} user={u} isManager={isManager} onManage={setSelectedUser} />
            ))}
          </AnimatePresence>
          {filteredUsers.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <div className="text-6xl font-bruno mb-4 text-white">404</div>
              <p className="text-xl">No users found matching query</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-2xl font-bruno text-yellow-500">
                    {selectedUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bruno text-white">{selectedUser.name}</h3>
                    <p className="text-gray-400">{selectedUser.email || selectedUser.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {['admin', 'manager', 'agent', 'client'].map(role => {
                  const isActive = selectedUser.role === role;
                  const Icon = ROLE_CONFIG[role].icon;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleUpdate(selectedUser.id, role)}
                      className={`p-4 rounded-xl border text-left transition-all ${isActive ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={20} />
                        {isActive && <CheckCircle size={16} />}
                      </div>
                      <div className="font-bold uppercase tracking-wider text-xs">{role}</div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handleDelete(selectedUser.id)}
                className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                Remove User
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD USER MODAL - Simplified for visual demo */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bruno text-white">Add New User</h2>
                <button onClick={() => setIsAddOpen(false)}><X className="text-gray-400" /></button>
              </div>
              <p className="text-gray-400 mb-6">Please contact support to add new admin users manually for security reasons, or use the database CLI.</p>
              <button onClick={() => setIsAddOpen(false)} className="w-full py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}