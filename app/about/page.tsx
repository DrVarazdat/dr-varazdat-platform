"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

export default function About() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ title: "Loading...", description: "", image_url: "/profile.jpg" });
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    const fetchAboutData = async () => {
      const { data: bioData } = await supabase.from("site_content").select("*").eq("id", "about_bio").single();
      if (bioData) setProfile(bioData);
      const { data: expData } = await supabase.from("experience").select("*").order("created_at", { ascending: true });
      if (expData) setExperience(expData);
      const { data: eduData } = await supabase.from("education").select("*").order("created_at", { ascending: true });
      if (eduData) setEducation(eduData);
      setLoading(false);
    };
    fetchAboutData();
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <motion.div variants={fadeUp} className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden mb-6 border border-black/10 dark:border-white/10 shadow-xl bg-gray-100 dark:bg-gray-900">
            <Image src={profile.image_url} alt="Profile" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{profile.title}</h2>
          <p className="text-navy dark:text-blue-400 font-medium mb-4">PhD in Computer Science</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{profile.description}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="md:col-span-8">
          <h1 className="text-4xl font-bold mb-12">Professional <span className="text-navy dark:text-blue-400">Journey.</span></h1>
          <h3 className="text-2xl font-bold mb-6 border-b pb-2 border-black/10 dark:border-white/10">Work Experience</h3>
          <div className="mb-12">
            {experience.map((exp) => (
              <div key={exp.id} className="mb-8 relative pl-6 border-l-2 border-navy/30 dark:border-blue-500/30">
                <div className="absolute w-3 h-3 bg-navy dark:bg-blue-500 rounded-full -left-[7px] top-1.5 shadow-[0_0_10px_rgba(30,58,138,0.5)]"></div>
                <h4 className="text-lg font-bold">{exp.role}</h4>
                <p className="text-navy dark:text-blue-400 font-medium text-sm mb-2">{exp.company} • {exp.duration}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
          <h3 className="text-2xl font-bold mb-6 border-b pb-2 border-black/10 dark:border-white/10">Education</h3>
          <div>
            {education.map((edu) => (
              <div key={edu.id} className="mb-8 relative pl-6 border-l-2 border-gray-300 dark:border-gray-700">
                <div className="absolute w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full -left-[7px] top-1.5"></div>
                <h4 className="text-lg font-bold">{edu.degree}</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-1">{edu.institution}</p>
                <p className="text-gray-500 text-sm">{edu.years}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}