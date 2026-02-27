'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { X, Phone, Store, Crown, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UpgradeToSellerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeToSellerModal({ isOpen, onClose }: UpgradeToSellerModalProps) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    businessName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const router = useRouter()
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const backgroundX = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), { stiffness: 300, damping: 30 })
  const backgroundY = useSpring(useTransform(mouseY, [0, 1], [-5, 5]), { stiffness: 300, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX.set(clientX / innerWidth)
      mouseY.set(clientY / innerHeight)
    }
    
    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove)
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isOpen, mouseX, mouseY])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not found')
      }

      // Update user metadata to seller role
      const { error } = await supabase.auth.updateUser({
        data: {
          role: 'seller',
          phone_number: formData.phoneNumber,
          business_name: formData.businessName || null
        }
      })

      if (error) throw error

      setSuccess(true)
      
      // Redirect to seller dashboard after success
      setTimeout(() => {
        router.push('/seller-dashboard')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Failed to upgrade to seller')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md"
          >
            <div className="glass rounded-[28px] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
              {/* 3D Background for Modal */}
              <div className="absolute inset-0">
                <motion.div
                  className="absolute top-10 left-10 w-32 h-32 bg-[#E0E5E9]/10 rounded-full blur-2xl"
                  style={{
                    x: backgroundX,
                    y: backgroundY,
                  }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-32 h-32 bg-[#004E64]/20 rounded-full blur-2xl"
                  style={{
                    x: backgroundX,
                    y: backgroundY,
                  }}
                />
              </div>

              {/* Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[28px]"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 glass rounded-xl">
                      <Crown className="w-6 h-6 text-[#E0E5E9]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Become a Seller</h2>
                      <p className="text-white/60 text-sm">Upgrade your account</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 glass rounded-lg text-white/60 hover:text-white smooth-transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/20">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
                    <p className="text-white/60">Your account has been upgraded to seller. Redirecting to dashboard...</p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Phone Number Field */}
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <motion.input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('phoneNumber')}
                        onBlur={() => setFocusedField('')}
                        placeholder="+855 12 345 678"
                        className={`w-full px-4 py-4 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none smooth-transition ${
                          focusedField === 'phoneNumber' 
                            ? 'border-[#E0E5E9]/50 shadow-lg shadow-[#E0E5E9]/20' 
                            : 'border-white/20'
                        }`}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      />
                    </div>

                    {/* Business Name Field */}
                    <div>
                      <label className="block text-white/80 font-medium mb-2">
                        Business/Shop Name <span className="text-white/40">(Optional)</span>
                      </label>
                      <motion.input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('businessName')}
                        onBlur={() => setFocusedField('')}
                        placeholder="Enter your business name"
                        className={`w-full px-4 py-4 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none smooth-transition ${
                          focusedField === 'businessName' 
                            ? 'border-[#E0E5E9]/50 shadow-lg shadow-[#E0E5E9]/20' 
                            : 'border-white/20'
                        }`}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      />
                    </div>

                    {/* Benefits */}
                    <div className="glass rounded-2xl p-4">
                      <h4 className="text-white/80 font-medium mb-3">Seller Benefits:</h4>
                      <ul className="space-y-2 text-white/60 text-sm">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#E0E5E9] rounded-full"></div>
                          <span>List unlimited products</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#E0E5E9] rounded-full"></div>
                          <span>Access to seller dashboard</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#E0E5E9] rounded-full"></div>
                          <span>Order management tools</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-[#E0E5E9] rounded-full"></div>
                          <span>Sales analytics</span>
                        </li>
                      </ul>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full glass px-6 py-4 rounded-2xl text-white font-semibold hover:bg-[#E0E5E9]/20 smooth-transition flex items-center justify-center space-x-2 relative overflow-hidden group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Store className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">
                        {loading ? 'Upgrading...' : 'Become a Seller'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E0E5E9]/10 to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
                    </motion.button>
                  </motion.form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
