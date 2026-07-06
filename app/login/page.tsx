"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Network } from "lucide-react"; 

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/admin"); // Redirects Admin straight to the Dashboard
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Account created! You can now sign in.");
        setIsLogin(true);
      }
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50 dark:bg-[#020202]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center shadow-lg"><Network size={24} /></div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Sign in to access your platform.</p>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm text-center">{error}</div>}

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:border-navy transition-colors" placeholder="Email address" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:border-navy transition-colors" placeholder="Password" />
            <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-navy hover:bg-navy-dark text-white rounded-xl font-medium transition-colors shadow-lg">
              {loading ? "Processing..." : isLogin ? "Sign In with Email" : "Create Account"}
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-gray-300 dark:border-gray-700 w-full"></div>
            <span className="relative bg-white dark:bg-black px-4 text-xs text-gray-400 uppercase tracking-widest">Or</span>
          </div>

          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 border border-black/20 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
          </button>

          <div className="text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-navy dark:text-blue-400 font-bold hover:underline">{isLogin ? "Sign Up" : "Sign In"}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}