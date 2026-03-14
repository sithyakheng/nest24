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
    icon: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1773312754/nestkh/rutdnjul41sbyldamczk.png',
    apple: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1773312754/nestkh/rutdnjul41sbyldamczk.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-white">
      <head>
        <link rel="icon" href="https://res.cloudinary.com/dis7tyccn/image/upload/v1773312754/nestkh/rutdnjul41sbyldamczk.png" />
      </head>
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
