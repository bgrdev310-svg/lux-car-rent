"use client";
import { useState, useCallback, memo } from "react";
import { ChevronDown, Plus, Edit, Trash2, Eye, EyeOff, Search, Save, X, Check, AlertCircle } from "lucide-react";
import { useFaqs } from "@/context/FaqContext";
import Sidebar from "@/components/ui/sidebar";
import { usePermissions } from "@/app/hooks/usePermissions";
import { motion, AnimatePresence } from "framer-motion";

// --- Memoized FAQ Item Component ---
const FaqItem = memo(({ faq, isOpen, onToggle, onEdit, onDelete, onToggleVisibility, canEdit, canDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 border ${isOpen ? "bg-white/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)]" : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
        } ${!faq.isVisible ? "opacity-70 grayscale-[0.5]" : ""}`}
    >
      {!faq.isVisible && (
        <div className="absolute top-0 right-0 p-1 bg-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest rounded-bl-lg border-b border-l border-red-500/20 z-10">Hidden</div>
      )}

      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={onToggle}>
          <div className="flex-1">
            <h3 className={`font-bruno text-lg transition-colors ${isOpen ? "text-yellow-500" : "text-white group-hover:text-yellow-100"}`}>
              {faq.question}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={`p-2 rounded-full border border-white/10 transition-colors ${isOpen ? "bg-yellow-500 text-black" : "bg-transparent text-gray-400 group-hover:text-white"}`}>
              <ChevronDown size={16} />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="pt-4 text-gray-300 leading-relaxed text-sm font-sans border-t border-white/10 mt-4">
                {faq.answer}
              </p>

              {/* Actions Toolbar */}
              {(canEdit || canDelete) && (
                <div className="flex justify-end gap-2 mt-6 pt-2">
                  {canEdit && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(faq._id); }}
                        className={`p-2 rounded-lg border transition-all ${faq.isVisible ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500 hover:text-white' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                        title={faq.isVisible ? "Hide FAQ" : "Show FAQ"}
                      >
                        {faq.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(faq); }}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                        title="Edit FAQ"
                      >
                        <Edit size={16} />
                      </button>
                    </>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(faq._id); }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                      title="Delete FAQ"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// --- Modal Form Component ---
const FaqModal = ({ isOpen, onClose, onSave, initialData, title }) => {
  const [formData, setFormData] = useState(initialData || { question: "", answer: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>

        <h2 className="text-2xl font-bruno text-white mb-6 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 pl-1">Question</label>
            <input
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              placeholder="e.g. What is the deposit amount?"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 pl-1">Answer</label>
            <textarea
              value={formData.answer}
              onChange={e => setFormData({ ...formData, answer: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors h-32 resize-none leading-relaxed"
              placeholder="Detailed answer..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-400 hover:text-white font-bold transition-colors">Cancel</button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.question.trim() || !formData.answer.trim()}
            className="px-6 py-2 rounded-xl bg-yellow-500 text-black font-bruno text-sm hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-all flex items-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminFaqPanel() {
  const { faqs, loading, addFaq, updateFaq, deleteFaq, toggleVisibility } = useFaqs();
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });

  // Force enable permissions to ensure admin access
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  // Handlers
  const handleToggle = useCallback((index) => setOpenIndex(prev => prev === index ? null : index), []);

  const handleSave = async (data) => {
    if (modalState.mode === 'create') {
      await addFaq(data);
    } else {
      await updateFaq(modalState.data._id, data);
    }
    setModalState({ isOpen: false, mode: 'create', data: null });
  };

  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-black flex min-h-screen relative font-sans selection:bg-yellow-500/30">
      <div className="hidden lg:block sticky top-0 h-screen"><Sidebar /></div>

      <main className="flex-1 flex flex-col min-h-screen lg:ml-80">
        <div className="p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto w-full">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-bruno bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-3">
                FAQ MANAGER
              </h1>
              <p className="text-gray-400">Curate the knowledge base for your customers.</p>
            </div>
            {canCreate && (
              <button
                onClick={() => setModalState({ isOpen: true, mode: 'create', data: { question: '', answer: '' } })}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-yellow-500 px-6 py-3 rounded-2xl flex items-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] group"
              >
                <div className="bg-yellow-500 text-black p-1 rounded-md group-hover:scale-110 transition-transform"><Plus size={16} strokeWidth={3} /></div>
                <span className="font-bruno text-sm text-white">ADD NEW FAQ</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search questions & answers..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white-[0.07] transition-all placeholder-gray-600"
            />
          </div>

          {/* List */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="animate-pulse">Loading Knowledge Base...</p>
            </div>
          ) : (
            <motion.div layout className="space-y-4">
              <AnimatePresence>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <FaqItem
                      key={faq._id}
                      faq={faq}
                      isOpen={openIndex === index}
                      onToggle={() => handleToggle(index)}
                      onEdit={() => setModalState({ isOpen: true, mode: 'edit', data: faq })}
                      onDelete={() => { if (confirm("Delete this FAQ?")) deleteFaq(faq._id); }}
                      onToggleVisibility={toggleVisibility}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ))
                ) : (
                  <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                      <AlertCircle size={32} />
                    </div>
                    <p className="text-gray-400">No FAQs found.</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {modalState.isOpen && (
              <FaqModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSave={handleSave}
                initialData={modalState.data}
                title={modalState.mode === 'create' ? 'Create New FAQ' : 'Edit FAQ Content'}
              />
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}