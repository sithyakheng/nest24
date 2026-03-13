import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: 'NestKH - Premium Cambodian Marketplace',
  description: "Cambodia's premier digital marketplace",
  icons: {
    icon: '/nestkh-logo.svg',
    apple: '/nestkh-logo.svg',
    shortcut: '/nestkh-logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-white">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
