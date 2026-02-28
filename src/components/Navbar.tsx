'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Menu, X } from 'lucide-react'
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
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 smooth-transition ${
          scrolled
            ? 'glass shadow-lg'
            : 'glass'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/" className="text-3xl font-bold text-[#004E64] tracking-tight">
                NESTKH
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                Home
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                Categories
              </Link>
              <Link href="/deals" className="text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                Deals
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                About
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 focus:border-[#004E64] smooth-transition text-gray-700 placeholder-gray-400"
                />
              </motion.div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* User Account */}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                    <span className="text-[#004E64] font-semibold">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center space-x-3">
                    {isSeller ? (
                      <Link
                        href="/seller-dashboard"
                        className="text-gray-600 hover:text-[#004E64] smooth-transition font-medium"
                      >
                        Seller Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        className="text-gray-600 hover:text-[#004E64] smooth-transition font-medium"
                      >
                        Profile
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="text-gray-600 hover:text-[#004E64] smooth-transition font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-[#004E64] smooth-transition font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="glass px-6 py-2 rounded-2xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-[#004E64] smooth-transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-40 glass md:hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link href="/" className="block text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                Home
              </Link>
              <Link href="/categories" className="block text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                Categories
              </Link>
              <Link href="/deals" className="block text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                Deals
              </Link>
              <Link href="/about" className="block text-gray-700 hover:text-[#004E64] smooth-transition font-medium">
                About
              </Link>
              {!user && (
                <div className="pt-4 border-t border-gray-200">
                  <Link href="/login" className="block text-gray-700 hover:text-[#004E64] smooth-transition font-medium mb-2">
                    Login
                  </Link>
                  <Link href="/register" className="block glass px-6 py-2 rounded-2xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition font-medium text-center">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
