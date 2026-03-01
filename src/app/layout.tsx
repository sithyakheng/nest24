import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NestKH - Premium Lifestyle Marketplace",
  description: "Curated products. Modern living. Trusted quality in Cambodia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Glowing Orbs Background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {/* Teal orb top left */}
          <div style={{
            position: 'absolute', top: '-150px', left: '-100px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }} />
          
          {/* Amber orb bottom right */}
          <div style={{
            position: 'absolute', bottom: '-150px', right: '-100px',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }} />
          
          {/* Purple orb center */}
          <div style={{
            position: 'absolute', top: '40%', left: '35%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,60,220,0.15) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }} />
        </div>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
