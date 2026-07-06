"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase.from("blog").select("*").eq("id", params.id).single();
      if (data) setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Article...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center">Article not found.</div>;

  return (
    <div className="pb-20 bg-white dark:bg-[#020202] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={() => router.push("/blog")} className="flex items-center gap-2 text-gray-500 hover:text-navy transition-colors mb-12">
          <ArrowLeft size={18} /> Back to Articles
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-4 text-sm text-navy dark:text-blue-400 font-bold mb-6 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Calendar size={16}/> {post.date}</span>
            <span className="flex items-center gap-2"><User size={16}/> Dr. V. Avetisyan</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-12">{post.title}</h1>

          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-16 shadow-2xl">
            <Image src={post.image_url || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485"} alt={post.title} fill className="object-cover" />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line">
            {post.description}
          </div>
        </motion.div>
      </div>
    </div>
  );
}