'use client'

import { motion } from 'framer-motion'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#080a0f] relative overflow-hidden">
      {/* LIQUID GLASS BACKGROUND ORBS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Large Teal Orb */}
        <div 
          className="fixed top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,78,100,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />
        
        {/* Warm Amber Orb */}
        <div 
          className="fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232,201,126,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />
        
        {/* Purple Orb */}
        <div 
          className="fixed top-[40%] left-[40%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(120,60,220,0.12) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative z-10 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  )
}
