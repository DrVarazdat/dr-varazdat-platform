"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Talks() {
  const [talks, setTalks] = useState<any[]>([]);
  useEffect(() => { supabase.from("talks").select("*").order("created_at", { ascending: false }).then(({ data }) => setTalks(data || [])); }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-12">Keynotes & <span className="text-navy dark:text-blue-400">Talks.</span></h1>
        <div className="space-y-6">
          {talks.map(talk => (
            <div key={talk.id} className="flex gap-6 p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-black/50 hover:border-navy transition-colors">
              <div className="p-4 bg-navy/10 text-navy rounded-full h-fit"><Mic size={24}/></div>
              <div>
                <h3 className="text-xl font-bold mb-2">{talk.title}</h3>
                <p className="text-sm text-navy dark:text-blue-400 mb-2">{talk.date}</p>
                <p className="text-gray-600 dark:text-gray-400">{talk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}