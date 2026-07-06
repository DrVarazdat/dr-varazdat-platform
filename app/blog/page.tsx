"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => { supabase.from("blog").select("*").order("created_at", { ascending: false }).then(({ data }) => setPosts(data || [])); }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-12">Research & <span className="text-navy dark:text-blue-400">Articles.</span></h1>
        <div className="grid gap-8">
          {posts.map(post => (
            <div key={post.id} className="p-6 border-b border-black/10 dark:border-white/10 group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
              <p className="text-sm text-gray-500 mb-2">{post.date}</p>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-navy transition-colors">{post.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{post.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}