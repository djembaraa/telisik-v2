import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./../components/layout/Navbar";
import MobileBottomNav from "./../components/layout/MobileBottomNav";

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
    <html lang="id">
      <body>
        <Navbar />
        
        <main className="min-h-screen pb-[64px] lg:pb-0"> 
          {children}
        </main>

        <MobileBottomNav />
      </body>
    </html>
  );
}