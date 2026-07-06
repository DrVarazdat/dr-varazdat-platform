"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MyCourses() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); 
        return;
      }
      
      setUserEmail(session.user.email);
      
      // MAGIC: Fetch only the requests made by THIS student!
      const { data } = await supabase
        .from("requests")
        .select("*")
        .eq("user_email", session.user.email)
        .order("created_at", { ascending: false });
        
      if (data) setMyCourses(data);
      setLoading(false);
    };
    fetchStudentData();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 min-h-[calc(100vh-4rem)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="flex justify-between items-end mb-12 border-b border-black/10 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Student <span className="text-navy dark:text-blue-400">Dashboard.</span></h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {userEmail}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">Your Enrollments</h3>
        
        {myCourses.length === 0 ? (
          <p className="text-gray-500">You have not registered for any courses or workshops yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {myCourses.map((course) => (
              <div key={course.id} className="p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-black/50 hover:border-navy transition-colors">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-navy dark:text-blue-400" />
                    <h4 className="text-xl font-bold">{course.course_title}</h4>
                  </div>
                  {/* Status Badge */}
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${course.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.status}
                  </span>
                </div>
                
                {course.status === "Approved" ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle size={16} /> Enrollment Confirmed. Check your email for syllabus details.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                    <Clock size={16} /> Pending Admin Approval.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
