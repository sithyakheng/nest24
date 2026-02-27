'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState('')
  const router = useRouter()
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const backgroundX = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), { stiffness: 300, damping: 30 })
  const backgroundY = useSpring(useTransform(mouseY, [0, 1], [-20, 20]), { stiffness: 300, damping: 30 })

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

  const getPasswordStrength = (password: string) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'buyer'
          }
        }
      })

      if (error) throw error

      router.push('/')
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#004E64] via-[#004E64]/90 to-[#003a47]">
      {/* 3D Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
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
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Floating Glass Auth Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-[28px] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[28px]"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-white mb-2">NESTKH</h1>
                <p className="text-white/70 text-sm">Premium Lifestyle Marketplace</p>
              </motion.div>

              {/* Welcome Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-semibold text-white mb-2">Create Your Nest</h2>
                <p className="text-white/60">Join NestKH and experience modern living.</p>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
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

                {/* Full Name Field */}
                <div className="relative">
                  <motion.input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Full Name"
                    className={`w-full px-4 py-4 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none smooth-transition ${
                      focusedField === 'fullName' 
                        ? 'border-[#E0E5E9]/50 shadow-lg shadow-[#E0E5E9]/20' 
                        : 'border-white/20'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <motion.input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Email"
                    className={`w-full px-4 py-4 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none smooth-transition ${
                      focusedField === 'email' 
                        ? 'border-[#E0E5E9]/50 shadow-lg shadow-[#E0E5E9]/20' 
                        : 'border-white/20'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Password"
                    className={`w-full px-4 py-4 pr-12 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none smooth-transition ${
                      focusedField === 'password' 
                        ? 'border-[#E0E5E9]/50 shadow-lg shadow-[#E0E5E9]/20' 
                        : 'border-white/20'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 smooth-transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2 flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <motion.div
                          key={level}
                          className="h-1 flex-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: 0.1 * level, duration: 0.3 }}
                          style={{
                            backgroundColor: passwordStrength >= level 
                              ? passwordStrength <= 2 ? '#ef4444' : passwordStrength === 3 ? '#f59e0b' : '#10b981'
                              : 'rgba(255, 255, 255, 0.2)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <motion.input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Confirm Password"
                    className={`w-full px-4 py-4 pr-12 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none smooth-transition ${
                      focusedField === 'confirmPassword' 
                        ? 'border-[#E0E5E9]/50 shadow-lg shadow-[#E0E5E9]/20' 
                        : 'border-white/20'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 smooth-transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full glass px-6 py-4 rounded-2xl text-white font-semibold hover:bg-white/20 smooth-transition flex items-center justify-center space-x-2 relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span className="relative z-10">{loading ? 'Creating account...' : 'Create Account'}</span>
                  {!loading && <ArrowRight className="w-5 h-5 relative z-10" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
                </motion.button>
              </motion.form>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-center mt-8"
              >
                <p className="text-white/60">
                  Already have an account?{' '}
                  <motion.a
                    href="/login"
                    className="text-white hover:text-[#E0E5E9] smooth-transition font-medium relative inline-block"
                    whileHover={{ y: -1 }}
                  >
                    Sign in
                    <motion.div
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E0E5E9]"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
