"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, UserCircle, Globe, LogOut, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import "../lib/i18n"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeLang, setActiveLang] = useState(i18n.language ? i18n.language.toUpperCase() : "EN");
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfileOpen(false)
    router.push("/")
  }

  const navLinks = [
    { name: t("nav_home", "Home"), path: "/" },
    { name: t("nav_about", "About"), path: "/about" },
    { name: t("nav_courses", "Courses"), path: "/courses" },
    { name: t("nav_workshops", "Workshops"), path: "/workshops" },
    { name: t("nav_video_courses", "Video Courses"), path: "/video-courses" },
    { name: t("nav_talks", "Talks"), path: "/talks" },
    { name: t("nav_blog", "Blog"), path: "/blog" },
    { name: t("nav_projects", "Projects"), path: "/projects" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-darkBg/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/" className="font-bold tracking-[0.2em] uppercase text-sm hover:text-navy transition-colors">
          Dr. V. Avetisyan
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} className="hover:text-navy dark:hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 border border-black/20 dark:border-white/20 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm font-medium">
              <Globe size={16} />{activeLang}
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-24 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-md shadow-lg overflow-hidden flex flex-col">
                  {["EN", "HY", "RU"].map((lang) => (
                    <button key={lang} onClick={() => { setActiveLang(lang); i18n.changeLanguage(lang); setLangOpen(false); }} className="px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/10 hover:text-navy dark:hover:text-blue-400 transition-colors">
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 border border-black/20 dark:border-white/20 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {!user ? (
            <Link href="/login" className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-navy rounded-md hover:bg-navy-dark transition-colors shadow-sm ml-2">
              <UserCircle size={16} /> Login
            </Link>
          ) : (
            <div className="relative ml-2">
              <button onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }} className="flex items-center justify-center w-8 h-8 bg-navy text-white rounded-full hover:bg-navy-dark transition-colors">
                {user.email?.charAt(0).toUpperCase()}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-md shadow-lg overflow-hidden flex flex-col py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-black/10 dark:border-white/10 truncate">{user.email}</div>
                    
                    {/* SMART ADMIN / STUDENT DASHBOARD LOGIC */}
                    {user.email === "varazdat.platform@hotmail.com" ? (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold">
                        <BookOpen size={14} /> Admin Dashboard
                      </Link>
                    ) : (
                      <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <BookOpen size={14} /> Student Dashboard
                      </Link>
                    )}

                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"><LogOut size={14} /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
