import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BotpressChat from "../components/BotpressChat"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dr. Varazdat Avetisyan | AI Expert & PhD",
  description: "Professional Portfolio and LMS for Dr. Varazdat Avetisyan",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <BotpressChat /> 
        </ThemeProvider>
      </body>
    </html>
  );
}