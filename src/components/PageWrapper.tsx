'use client'

import { motion } from 'framer-motion'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0d0e12] relative overflow-hidden">
      {/* Background Blobs */}
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 rounded-full bg-teal-900 opacity-20 blur-3xl pointer-events-none"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -15, 15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-amber-900 opacity-15 blur-3xl pointer-events-none"
        animate={{
          x: [0, -20, 20, 0],
          y: [0, 15, -15, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="fixed top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-900 opacity-10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: [0, 15, -15, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  )
}
