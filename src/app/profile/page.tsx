'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { User, Mail, ShoppingBag, Crown, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import UpgradeToSellerModal from '@/components/UpgradeToSellerModal'

export default function Profile() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { user } = useAuth()
  const isSeller = user?.user_metadata?.role === 'seller'
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const backgroundX = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 })
  const backgroundY = useSpring(useTransform(mouseY, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX.set(clientX / innerWidth)
      mouseY.set(clientY / innerHeight)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#004E64] via-[#004E64]/90 to-[#003a47]">
      {/* 3D Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-[#E0E5E9]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#004E64]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#E0E5E9]/5 rounded-full blur-2xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="w-full max-w-2xl"
        >
          <div className="glass rounded-[28px] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[28px]"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-white mb-2">NESTKH</h1>
                <p className="text-white/70 text-sm">Your Profile</p>
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-white/60 mb-4">{user.email}</p>
                
                <div className="flex items-center justify-center space-x-2">
                  {isSeller ? (
                    <>
                      <Crown className="w-5 h-5 text-[#E0E5E9]" />
                      <span className="text-[#E0E5E9] font-medium">Seller Account</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 text-white/60" />
                      <span className="text-white/60 font-medium">Buyer Account</span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Account Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-4"
              >
                {!isSeller && (
                  <motion.button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full glass px-6 py-4 rounded-2xl text-white font-semibold hover:bg-[#E0E5E9]/20 smooth-transition flex items-center justify-center space-x-2 relative overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Crown className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Upgrade to Seller</span>
                    <ArrowRight className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#E0E5E9]/10 to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
                  </motion.button>
                )}

                <motion.button
                  className="w-full glass px-6 py-4 rounded-2xl text-white font-medium hover:bg-white/20 smooth-transition flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>View Orders</span>
                </motion.button>

                <motion.button
                  className="w-full glass px-6 py-4 rounded-2xl text-white font-medium hover:bg-white/20 smooth-transition flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-5 h-5" />
                  <span>Account Settings</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade to Seller Modal */}
      <UpgradeToSellerModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
