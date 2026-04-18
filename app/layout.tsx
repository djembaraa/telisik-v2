import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./../components/layout/Navbar";
import MobileBottomNav from "./../components/layout/MobileBottomNav";
import AuthBootstrap from "./../components/providers/AuthBootstrap";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Telisik UI - Modern",
  description: "Refactoring UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <AuthBootstrap />
        <Navbar />
        
        <main className="min-h-screen pb-[64px] lg:pb-0"> 
          {children}
        </main>

        <MobileBottomNav />
      </body>
    </html>
  );
}