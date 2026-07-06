import Link from "next/link"
export default function Footer() {
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-darkBg py-8 transition-colors mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">&copy; {new Date().getFullYear()} Dr. Varazdat Avetisyan. All Rights Reserved.</div>
        <div className="flex gap-6">
          <a href="https://www.youtube.com/@varazdatavetisyan3780/videos" target="_blank" className="text-xs text-navy uppercase tracking-widest hover:text-navy-dark dark:hover:text-blue-400 font-medium">YouTube</a>
          <a href="https://github.com/" target="_blank" className="text-xs text-navy uppercase tracking-widest hover:text-navy-dark dark:hover:text-blue-400 font-medium">GitHub</a>
          <a href="https://www.linkedin.com/in/varazdat-avetisyan-phd-66346650/" target="_blank" className="text-xs text-navy uppercase tracking-widest hover:text-navy-dark dark:hover:text-blue-400 font-medium">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}