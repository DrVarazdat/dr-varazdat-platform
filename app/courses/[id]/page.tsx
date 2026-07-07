"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle, Clock, Calendar, MapPin, ChevronDown, Lock } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openLesson, setOpenLesson] = useState<number | null>(0);
  const [buttonState, setButtonState] = useState("default"); // default, pending

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const { data } = await supabase.from("courses").select("*").eq("id", params.id).single();
      if (data) setCourse(data);
      setLoading(false);
    };
    fetchCourseDetails();
  }, [params.id]);

  // MAGIC CONNECTION: This sends the request to the database!
  const handleParticipate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If they are not logged in, tell them to log in!
    if (!session) {
      alert("Please log in or create an account to participate in this course.");
      router.push("/login");
      return;
    }

    // Change button to yellow "Pending" state
    setButtonState("pending");

    // Save the request to Supabase!
    const { error } = await supabase.from("requests").insert([
      { 
        user_email: session.user.email, 
        course_title: course.title, 
        status: "Pending" 
      }
    ]);

    if (error) {
      alert("Error sending request: " + error.message);
      setButtonState("default");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Course Details...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found.</div>;

  const lessons = [
    { title: "Module 1: Mathematical Foundations", details: "• Lecture 1.1: Vectors, Matrices, and Tensors\n• Lecture 1.2: Matrix Multiplication" },
    { title: "Module 2: Neural Architecture", details: "• Lecture 2.1: The Biological Inspiration\n• Lecture 2.2: Forward Propagation" },
  ];

  return (
    <div className="pb-20">
      <div className="relative w-full h-[40vh] min-h-[300px]">
        <Image src={course.image_url || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"} alt={course.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
              <span className={`px-3 py-1 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 inline-block ${course.status === 'Upcoming' ? 'bg-navy' : course.status === 'Active Now' ? 'bg-green-600' : 'bg-gray-600'}`}>
                {course.status} Course
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{course.title}</h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 border-b border-black/10 dark:border-white/10 pb-2">Course Overview</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed whitespace-pre-line">{course.description}</p>
            
            <h3 className="text-xl font-bold mb-4">Lesson Breakdown</h3>
            <div className="flex flex-col gap-3">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-black/50">
                  <button onClick={() => setOpenLesson(openLesson === idx ? null : idx)} className="w-full flex items-center justify-between p-4 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                    {lesson.title} <ChevronDown size={18} className={`transition-transform ${openLesson === idx ? "rotate-180" : ""}`} />
                  </button>
                  <motion.div initial={false} animate={{ height: openLesson === idx ? "auto" : 0, opacity: openLesson === idx ? 1 : 0 }} className="overflow-hidden">
                    <div className="p-4 pt-0 text-gray-600 dark:text-gray-400 text-sm border-t border-black/5 dark:border-white/5 mt-2 whitespace-pre-line leading-loose">{lesson.details}</div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-24 bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-6">
              <div className="text-3xl font-bold text-navy dark:text-blue-400 mb-6 pb-6 border-b border-black/10 dark:border-white/10">{course.price}</div>
              
              <div className="flex flex-col gap-4 mb-8 text-sm">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300"><Calendar size={18} className="text-navy"/> {course.start_date || "TBD"}</div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300"><Clock size={18} className="text-navy"/> {course.duration || "TBD"}</div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300"><MapPin size={18} className="text-navy"/> {course.location || "TBD"}</div>
              </div>

              {/* DYNAMIC SMART BUTTON */}
              {course.status === "Upcoming" ? (
                buttonState === "default" ? (
                  <button onClick={handleParticipate} className="w-full py-4 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1">
                    Participate Now
                  </button>
                ) : (
                  <button disabled className="w-full py-4 bg-yellow-600 text-white rounded-xl font-bold transition-all shadow-inner cursor-not-allowed">
                    ⏳ Request Sent (Pending)
                  </button>
                )
              ) : (
                <button disabled className="w-full py-4 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Lock size={18} /> {course.status === "Active Now" ? "Registration Closed" : "Course Archived"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
