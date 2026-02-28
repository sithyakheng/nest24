'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, ShoppingBag, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const isSeller = user?.user_metadata?.role === 'seller'
  const signOut = () => supabase.auth.signOut()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Floating Control Panel */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          y: scrolled ? -4 : 0
        }}
        transition={{ 
          duration: 0.6,
          y: { duration: 0.3 }
        }}
        className="fixed top-8 left-1/2 right-1/2 z-50 -translate-x-1/2 max-w-5xl w-full px-6"
      >
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-white/[0.05] backdrop-blur-3xl border border-white/[0.08] border-t-white/[0.18] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] px-6 py-4"
        >
          <div className="flex items-center justify-between">
            {/* Premium Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <span className="font-black tracking-tight text-white text-xl">NestKH</span>
                <div className="absolute -top-1 -right-2 w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              </div>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/browse" 
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Browse
              </Link>
              <Link 
                href="/sellers" 
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Sellers
              </Link>
              <Link 
                href="/about" 
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                About
              </Link>
            </div>

            {/* Right Side - Search & Auth */}
            <div className="flex items-center space-x-4">
              {/* Floating Search Console */}
              <div className="hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search premium products..."
                    className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-2 pr-10 text-white placeholder:text-white/40 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/30"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
              </div>

              {/* Auth Buttons */}
              {!user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/signin"
                    className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/[0.12] transition-all font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-4 py-2 font-medium transition-all"
                  >
                    Start Selling
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {isSeller ? (
                    <Link
                      href="/seller-dashboard"
                      className="flex items-center space-x-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/[0.12] transition-all font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      href="/buyer-dashboard"
                      className="flex items-center space-x-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/[0.12] transition-all font-medium"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="hidden sm:inline">Orders</span>
                    </Link>
                  )}
                  
                  <div className="relative group">
                    <button 
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full p-2 text-white/80 hover:text-white hover:bg-white/[0.12] transition-all"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {mobileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-12 bg-white/[0.08] backdrop-blur-3xl border border-white/[0.12] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-2 min-w-[200px]"
                        >
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.12] rounded-xl transition-all"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full p-2 text-white/80 hover:text-white hover:bg-white/[0.12] transition-all"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-4 right-4 z-40 bg-white/[0.08] backdrop-blur-3xl border border-white/[0.12] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6"
          >
            <div className="space-y-4">
              <Link
                href="/browse"
                className="block text-white/80 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link
                href="/sellers"
                className="block text-white/80 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sellers
              </Link>
              <Link
                href="/about"
                className="block text-white/80 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
