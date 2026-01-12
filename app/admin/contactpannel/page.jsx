"use client";
import React, { useState, useEffect } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaInstagram,
  FaTelegramPlane,
  FaFacebookF,
  FaTimes,
  FaLink,
  FaCheck,
  FaPen,
  FaTrash,
  FaPlus,
  FaEye,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaSnapchatGhost,
  FaGlobe
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useContactData, AVAILABLE_PLATFORMS } from "@/app/components/data/contactdata";
import Sidebar from "@/components/ui/sidebar";
import { usePermissions } from "@/app/hooks/usePermissions";
import { cn } from "@/lib/utils";

// --- Data & Config ---
const infoIcons = {
  phone: FaPhoneAlt,
  email: FaEnvelope,
  hours: FaClock,
  address: FaMapMarkerAlt
};

const infoLabels = {
  phone: "Phone Number",
  email: "Email Address",
  hours: "Working Hours",
  address: "Office Address"
};

// --- Components ---

const LuxuryCard = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.1)]",
      className
    )}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors" />
    {children}
  </motion.div>
);

const ActionButton = ({ onClick, icon: Icon, label, variant = "gold", className, disabled }) => {
  const baseStyles = "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    gold: "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]",
    dark: "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20",
    danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20",
    success: "bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant], className)}>
      {Icon && <Icon size={14} />}
      {label && <span>{label}</span>}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-[#0F0F0F] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-700" />
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xl font-bruno text-white tracking-wide">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Main Page ---

export default function AdminContactsPage() {
  const { canEdit, canCreate, canDelete } = usePermissions();
  const { contactInfo, socialMedia, updateContactInfo, addSocialMedia, updateSocialMedia, toggleSocialActive, removeSocialMedia } = useContactData();

  const [editInfo, setEditInfo] = useState(null);
  const [editSocial, setEditSocial] = useState(null);

  // Handlers
  const handleInfoSave = async () => {
    if (editInfo) {
      await updateContactInfo(editInfo.field, editInfo.value);
      setEditInfo(null);
    }
  };

  const handleSocialSave = async () => {
    if (!editSocial) return;
    if (editSocial.id === 0) {
      await addSocialMedia(editSocial.platform, editSocial.link, editSocial.active);
    } else {
      await updateSocialMedia(editSocial.id, { ...editSocial });
    }
    setEditSocial(null);
  };

  return (
    <div className="flex bg-black min-h-screen text-white font-sans selection:bg-yellow-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/10 via-black to-black" />

      <Sidebar />

      <main className="flex-1 relative z-10 lg:ml-72 xl:ml-80 p-6 lg:p-12">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bruno text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-yellow-600 mb-3">
            CONTACT CENTER
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Manage your global presence. Ensure your clients can always reach the luxury they deserve.
          </p>
        </motion.div>

        {/* --- CONTACT INFO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {['phone', 'email', 'hours', 'address'].map((field, idx) => {
            const Icon = infoIcons[field];
            const value = contactInfo[field]?.value || "Not Set";

            return (
              <LuxuryCard key={field} delay={idx * 0.1} className="flex flex-col md:flex-row items-start md:items-center gap-6 group">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-yellow-500/20 to-black border border-yellow-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <Icon className="text-2xl text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{infoLabels[field]}</h3>
                  <p className="text-xl font-bold text-white leading-relaxed break-words whitespace-pre-wrap">
                    {value}
                  </p>
                </div>
                {/* Always showing edit button, but disabling if no permission could be an option. User wants availability. */}
                <ActionButton
                  icon={FaPen}
                  variant="dark"
                  onClick={() => setEditInfo({ field, value })}
                  className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                />
              </LuxuryCard>
            );
          })}
        </div>

        {/* --- SOCIAL MEDIA SECTION --- */}
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl font-bruno text-white mb-2">SOCIAL CHANNELS</h2>
            <p className="text-gray-500">Active platforms for client engagement.</p>
          </div>
          <ActionButton
            icon={FaPlus}
            label="Add Channel"
            onClick={() => setEditSocial({ id: 0, platform: "", link: "", active: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {socialMedia.map((social, idx) => {
            const Icon = social.icon || FaGlobe;
            return (
              <LuxuryCard key={social.id} delay={0.2 + (idx * 0.05)} className={cn("flex flex-col h-full", !social.active && "opacity-60")}>
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-3 rounded-lg bg-white/5", social.active ? "text-yellow-500" : "text-gray-500")}>
                    <Icon size={24} />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${social.active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                </div>

                <h4 className="text-lg font-bold text-white mb-1">{social.platform}</h4>
                <a href={social.link} className="text-xs text-gray-500 truncate hover:text-yellow-500 transition-colors mb-6 block" target="_blank">{social.link}</a>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <ActionButton
                    icon={FaPen}
                    variant="dark"
                    onClick={() => setEditSocial({ ...social })}
                    className="justify-center"
                  />
                  <ActionButton
                    icon={!social.active ? FaCheck : FaTimes}
                    variant={!social.active ? "success" : "danger"}
                    onClick={() => toggleSocialActive(social.id)}
                    className="justify-center"
                  />
                </div>
              </LuxuryCard>
            );
          })}
        </div>

      </main>

      {/* --- MODALS --- */}

      {/* Contact Info Modal */}
      <Modal isOpen={!!editInfo} onClose={() => setEditInfo(null)} title={`Edit ${editInfo ? infoLabels[editInfo.field] : ''}`}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>
            {editInfo?.field === 'hours' || editInfo?.field === 'address' ? (
              <textarea
                value={editInfo?.value || ''}
                onChange={e => setEditInfo({ ...editInfo, value: e.target.value })}
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-colors min-h-[120px] resize-none"
              />
            ) : (
              <input
                value={editInfo?.value || ''}
                onChange={e => setEditInfo({ ...editInfo, value: e.target.value })}
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-colors"
              />
            )}
          </div>
          <ActionButton label="Save Changes" onClick={handleInfoSave} className="w-full justify-center py-4" />
        </div>
      </Modal>

      {/* Social Modal */}
      <Modal isOpen={!!editSocial} onClose={() => setEditSocial(null)} title={editSocial?.id === 0 ? "New Channel" : "Edit Channel"}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Platform</label>
              <select
                value={editSocial?.platform || ''}
                onChange={e => setEditSocial({ ...editSocial, platform: e.target.value })}
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 outline-none"
              >
                <option value="">Select...</option>
                {Object.keys(AVAILABLE_PLATFORMS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Visibility</label>
              <button
                onClick={() => setEditSocial({ ...editSocial, active: !editSocial.active })}
                className={cn(
                  "w-full p-3 rounded-xl border font-bold text-sm transition-all",
                  editSocial?.active ? "border-green-500/30 bg-green-500/10 text-green-500" : "border-red-500/30 bg-red-500/10 text-red-500"
                )}
              >
                {editSocial?.active ? "Active" : "Hidden"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">URL Link</label>
            <input
              value={editSocial?.link || ''}
              onChange={e => setEditSocial({ ...editSocial, link: e.target.value })}
              className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <ActionButton
            label={editSocial?.id === 0 ? "Create Channel" : "Update Channel"}
            onClick={handleSocialSave}
            className="w-full justify-center py-4"
            disabled={!editSocial?.platform}
          />
        </div>
      </Modal>

    </div>
  );
}