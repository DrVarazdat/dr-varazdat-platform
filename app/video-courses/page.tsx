"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function VideoCourses() {
  const [videos, setVideos] = useState<any[]>([]);
  useEffect(() => { supabase.from("video_courses").select("*").order("created_at", { ascending: false }).then(({ data }) => setVideos(data || [])); }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <h1 className="text-4xl font-bold mb-4">Video <span className="text-navy dark:text-blue-400">Lectures.</span></h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">Watch recorded sessions, tutorials, and keynote talks directly from my YouTube channel.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((vid) => (
            <motion.div key={vid.id} className="group">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-black/10 dark:border-white/10 shadow-lg bg-black">
                {vid.youtube_id ? <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${vid.youtube_id}`} title={vid.title} allowFullScreen></iframe> : <div className="w-full h-full flex items-center justify-center text-white text-sm">No Video ID</div>}
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{vid.title}</h3>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}