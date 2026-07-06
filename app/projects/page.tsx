"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Code } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => { supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => setProjects(data || [])); }, []);
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-16 text-center">Featured <span className="text-navy dark:text-blue-400">Projects.</span></h1>
        <div className="flex flex-col gap-12">
          {projects.map((project) => (
            <div key={project.id} className="group flex flex-col md:flex-row border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a] hover:border-navy/50 dark:hover:border-navy transition-all duration-500">
              <div className="relative w-full md:w-[45%] h-64 md:h-auto min-h-[350px] bg-gray-100 dark:bg-black overflow-hidden border-r border-black/10 dark:border-white/10">
                <Image src={project.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                {project.role && <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy"><Code size={18}/></div><span className="text-xs font-bold tracking-[0.2em] uppercase text-navy">{project.role}</span></div>}
                <h3 className="text-3xl md:text-4xl font-bold mb-6">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">{project.description}</p>
                {project.tech_stack && <div className="flex flex-wrap gap-3 mb-10">{project.tech_stack.split(',').map((tech: string, i: number) => (<span key={i} className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-[#111111] dark:text-gray-300 rounded-lg">{tech.trim()}</span>))}</div>}
                <div className="mt-auto">{project.link ? <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-navy dark:text-blue-400 font-medium group/btn">Case Study <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></a> : <span className="text-gray-400 text-sm">Internal Project</span>}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}