"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GraduationCap, Code, Network } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [heroData, setHeroData] = useState({ title: "Pioneering the future of", highlight: "Artificial Intelligence.", description: "Loading...", image_url: "/hero.png" });

  useEffect(() => {
    const fetchHomeData = async () => {
      const { data } = await supabase.from("site_content").select("*").eq("id", "home_hero").single();
      if (data) {
        const words = data.title.split(" ");
        const highlight = words.splice(-2).join(" ");
        setHeroData({ title: words.join(" "), highlight: highlight, description: data.description, image_url: data.image_url || "/hero.png" });
      }
    };
    fetchHomeData();
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <section className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <motion.div className="flex-1 flex flex-col items-start text-left" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeUp} className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-navy bg-navy/10 dark:text-blue-400 dark:bg-blue-400/10 rounded-full">{t("hero_badge", "PHD / AI RESEARCHER")}</motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            {heroData.title} <br className="hidden md:block"/><span className="text-navy dark:text-blue-400">{heroData.highlight}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl leading-relaxed">{heroData.description}</motion.p>
          <motion.div variants={fadeUp} className="flex gap-4">
            <Link href="/courses" className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-navy rounded-md hover:bg-navy-dark transition-all shadow-lg hover:-translate-y-0.5">{t("btn_view_courses", "View Courses")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></Link>
            <Link href="/about" className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-200 dark:bg-white/5 transition-all">{t("btn_journey", "Professional Journey")}</Link>
          </motion.div>
        </motion.div>
        <motion.div className="flex-1 w-full max-w-md relative" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="absolute inset-0 bg-navy/20 dark:bg-blue-500/20 blur-3xl rounded-full transform -translate-y-4 translate-x-4"></div>
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl bg-gray-100 dark:bg-gray-900">
            <Image src={heroData.image_url} alt="Dr. Varazdat Avetisyan" fill className="object-cover" priority />
          </div>
        </motion.div>
      </section>
      <motion.section className="w-full border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-darkBg/50 py-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h3 variants={fadeUp} className="text-sm font-mono tracking-widest text-gray-400 uppercase mb-10">{t("affiliations", "Featured Professional Affiliations")}</motion.h3>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold dark:text-white"><Network className="text-navy"/> FAST</div>
            <div className="flex items-center gap-2 text-xl font-bold dark:text-white"><Code className="text-navy"/> SASTIC</div>
            <div className="flex items-center gap-2 text-xl font-bold dark:text-white"><GraduationCap className="text-navy"/> Luseen Mobile</div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}