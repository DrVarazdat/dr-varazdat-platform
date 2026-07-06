"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      if (data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const renderSection = (title: string, statusFilter: string) => {
    const filteredCourses = courses.filter(c => c.status === statusFilter);
    if (filteredCourses.length === 0) return null;
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-black/10 dark:border-white/10">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <motion.div key={course.id} variants={fadeUp} whileHover={{ scale: 1.02 }} className="group flex flex-col bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-navy/10 transition-all duration-300">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                <Image src={course.image_url || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${statusFilter === "Upcoming" ? "bg-navy/90 text-white" : statusFilter === "Active Now" ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"}`}>
                  {course.status}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-navy dark:group-hover:text-blue-400 transition-colors">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 mt-auto">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {course.start_date || "TBD"}</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> {course.duration || "Self-paced"}</span>
                </div>
                <Link href={`/courses/${course.id}`} className="flex items-center justify-between w-full text-sm font-medium text-navy dark:text-blue-400 border-t border-black/5 dark:border-white/5 pt-4">
                  View Course Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Courses...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <motion.div variants={fadeUp} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Academic <span className="text-navy dark:text-blue-400">Courses.</span></h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">Explore comprehensive curriculums designed to bridge the gap between theoretical computer science and applied machine learning.</p>
        </motion.div>
        {courses.length === 0 ? <p className="text-gray-500">No courses available yet.</p> : <>{renderSection("Upcoming Courses", "Upcoming")}{renderSection("Active Courses", "Active Now")}{renderSection("Archived Courses", "Archived")}</>}
      </motion.div>
    </div>
  );
}