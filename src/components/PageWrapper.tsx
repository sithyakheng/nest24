'use client'

import { motion } from 'framer-motion'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0d0e12] relative overflow-hidden">
      {/* Spatial Environment Layers */}
      
      {/* Layer 1: Ambient Room Lighting */}
      <div className="fixed inset-0">
        {/* Center Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-white/[0.04] via-transparent to-transparent" 
             style={{
               background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04), transparent 60%)'
             }} />
        
        {/* Warm Right Side Light */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/[0.08] via-transparent to-transparent" />
        
        {/* Vignette Edges */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/[0.3]" 
             style={{
               background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)'
             }} />
      </div>

      {/* Layer 2: Floating Background Elements */}
      <motion.div
        className="fixed top-20 left-20 w-80 h-80 rounded-full bg-teal-500/[0.08] blur-3xl pointer-events-none"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="fixed bottom-20 right-20 w-96 h-96 rounded-full bg-amber-500/[0.06] blur-3xl pointer-events-none"
        animate={{
          x: [0, -25, 25, 0],
          y: [0, 20, -20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="fixed top-1/2 left-1/3 w-64 h-64 rounded-full bg-purple-500/[0.04] blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -25, 25, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Layer 3: Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative z-10 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  )
}
