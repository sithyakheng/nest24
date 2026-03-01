'use client'

import { motion } from 'framer-motion'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0f1115] relative">
      {/* Wall Panel Texture */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.02) 40px,
              rgba(255,255,255,0.02) 41px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.02) 40px,
              rgba(255,255,255,0.02) 41px
            )
          `
        }}
      />

      {/* Warm Spotlight from Right */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 85% 40%, rgba(232,201,126,0.12), transparent 50%)'
        }}
      />

      {/* Main Board Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative z-10 max-w-6xl mx-auto mt-20 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.7)] ${className}`}
      >
        {children}
      </motion.div>
    </div>
  )
}
