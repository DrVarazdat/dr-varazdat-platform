"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MyCourses() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); 
        return;
      }
      
      setUserEmail(session.user.email);
      
      // MAGIC: Fetch only the requests made by THIS specific student!
      const { data } = await supabase
        .from("requests")
        .select("*")
        .eq("user_email", session.user.email)
        .order("created_at", { ascending: false });
        
      if (data) setMyRequests(data);
      setLoading(false);
    };
    fetchStudentData();
  }, [router]);

  // Simulate Payment Process
  const handlePayment = async (requestId: string) => {
    await supabase.from("requests").update({ status: "Enrolled" }).eq("id", requestId);
    window.location.reload(); // Refresh the page to show they are now Enrolled!
  };

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

        <h3 className="text-2xl font-bold mb-6">Your Enrollments & Requests</h3>
        
        {myRequests.length === 0 ? (
          <p className="text-gray-500">You have not registered for any courses yet. Go to the Courses page to apply!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {myRequests.map((req) => (
              <div key={req.id} className="p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0a0a0a] hover:border-navy transition-colors shadow-sm">
                
                <div className="flex items-start justify-between gap-3 mb-4 border-b border-black/5 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-navy dark:text-blue-400" />
                    <h4 className="text-xl font-bold">{req.course_title}</h4>
                  </div>
                  {/* Status Badge */}
                  <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap
                    ${req.status === 'Enrolled' ? 'bg-green-100 text-green-700' : 
                      req.status === 'Awaiting Payment' ? 'bg-blue-100 text-blue-700' : 
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {req.status}
                  </span>
                </div>
                
                {/* DYNAMIC STATUS MESSAGES */}
                {req.status === "Pending" && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                    <Clock size={16} /> Application sent. Pending Admin Approval.
                  </div>
                )}

                {req.status === "Rejected" && (
                  <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <XCircle size={16} /> Application Denied. Please contact support.
                  </div>
                )}

                {req.status === "Awaiting Payment" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <CheckCircle size={16} /> Admin Approved! Please complete payment to secure your seat.
                    </div>
                    {/* Simulated Payment Button */}
                    <button 
                      onClick={() => handlePayment(req.id)}
                      className="w-full py-3 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy-dark transition-all shadow-md hover:-translate-y-0.5"
                    >
                      Pay via Secure Gateway
                    </button>
                  </div>
                )}

                {req.status === "Enrolled" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <CheckCircle size={16} /> Enrollment Confirmed!
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <strong>Next Class:</strong> Tuesday at 10:00 AM<br/>
                      <strong>Location:</strong> Zoom Link sent to your email.<br/>
                      <strong>Materials:</strong> Syllabus and reading list unlocked.
                    </div>
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
