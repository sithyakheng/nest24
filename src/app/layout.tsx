import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReactNode } from "react";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const LOGO_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1773312754/nestkh/rutdnjul41sbyldamczk.png`

export const metadata = {
  title: 'NestKH - Premium Cambodian Marketplace',
  description: "Cambodia's premier digital marketplace",
  icons: {
    icon: LOGO_URL,
    apple: LOGO_URL,
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
        <link rel="icon" href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1773312754/nestkh/rutdnjul41sbyldamczk.png`} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
