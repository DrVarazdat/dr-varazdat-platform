"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MapPin, Calendar, X, Users, Clock, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Workshops() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [buttonState, setButtonState] = useState("default");

  useEffect(() => {
    supabase.from("workshops").select("*").order("created_at", { ascending: false }).then(({ data }) => { setWorkshops(data || []); setLoading(false); });
  }, []);

  const closeModal = () => { setSelectedWorkshop(null); setButtonState("default"); };

  const renderGrid = (statusFilter: string) => {
    const filtered = workshops.filter(w => w.status === statusFilter);
    if (filtered.length === 0) return null;
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-black/10 dark:border-white/10">{statusFilter} Workshops</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((workshop) => (
            <motion.div key={workshop.id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedWorkshop(workshop)} className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-black group cursor-pointer hover:shadow-xl hover:shadow-navy/10 transition-all">
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900">
                <Image src={workshop.image_url || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} alt={workshop.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${statusFilter === "Upcoming" ? "bg-navy/90 text-white" : statusFilter === "Active Now" ? "bg-green-500/90 text-white" : "bg-gray-600/90 text-white"}`}>{statusFilter}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 group-hover:text-navy dark:group-hover:text-blue-400 transition-colors">{workshop.title}</h3>
                <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-2"><Calendar size={14}/> {workshop.date || "TBD"}</span>
                  <span className="flex items-center gap-2"><MapPin size={14}/> {workshop.location || "TBD"}</span>
                </div>
                <button className={`w-full py-2 rounded-md transition-colors font-medium ${statusFilter === "Upcoming" ? "bg-navy hover:bg-navy-dark text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500"}`}>
                  {statusFilter === "Upcoming" ? "View Details & Register" : "View Archive"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Workshops...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Interactive <span className="text-navy dark:text-blue-400">Workshops.</span></h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl text-lg">Hands-on sessions focusing on applied AI, neural architectures, and software engineering.</p>
        {workshops.length === 0 ? <p className="text-gray-500">No workshops scheduled right now.</p> : <>{renderGrid("Upcoming")}{renderGrid("Active Now")}{renderGrid("Archived")}</>}
      </motion.div>

      <AnimatePresence>
        {selectedWorkshop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
              <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-20"><X size={20} /></button>
              <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-900"><Image src={selectedWorkshop.image_url || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} alt={selectedWorkshop.title} fill className="object-cover" /></div>
              <div className="p-8">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full mb-4 inline-block ${selectedWorkshop.status === 'Upcoming' ? 'bg-navy/10 text-navy dark:bg-blue-900/30 dark:text-blue-400' : selectedWorkshop.status === 'Active Now' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300'}`}>{selectedWorkshop.status}</span>
                <h2 className="text-3xl font-bold mb-4">{selectedWorkshop.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-line">{selectedWorkshop.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-sm">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Calendar size={18} className="text-navy dark:text-blue-400"/> {selectedWorkshop.date || "TBD"}</div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Clock size={18} className="text-navy dark:text-blue-400"/> {selectedWorkshop.time || "TBD"}</div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><MapPin size={18} className="text-navy dark:text-blue-400"/> {selectedWorkshop.location || "TBD"}</div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Users size={18} className="text-navy dark:text-blue-400"/> {selectedWorkshop.capacity || "Limited Seats"}</div>
                </div>
                {selectedWorkshop.status === "Upcoming" ? (
                  buttonState === "default" ? <button onClick={() => setButtonState("pending")} className="w-full py-4 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-navy/30">Request Registration</button> : <button disabled className="w-full py-4 bg-yellow-600 text-white rounded-xl font-bold transition-all shadow-inner cursor-not-allowed">⏳ Request Sent (Pending Admin Approval)</button>
                ) : (
                  <button disabled className="w-full py-4 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed"><Lock size={18} /> {selectedWorkshop.status === "Active Now" ? "Registration Closed" : "Workshop Archived"}</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}