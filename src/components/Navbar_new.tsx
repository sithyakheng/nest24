'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, ShoppingBag, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchPlaceholder, setSearchPlaceholder] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  const placeholders = [
    "Search products...",
    "Find sellers...", 
    "Explore categories..."
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchPlaceholder(prev => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const isSeller = user?.user_metadata?.role === 'seller'

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/[0.12] backdrop-blur-xl' : 'bg-white/[0.06] backdrop-blur-2xl'
        } border border-white/[0.12] rounded-full px-6 py-3 max-w-5xl w-full mx-auto`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-black text-white text-xl">NestKH</span>
            <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(0,78,100,0.4)]"></div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/browse" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-white/30 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholders[searchPlaceholder]}
                className="bg-transparent text-white placeholder:text-white/30 text-sm focus:outline-none w-64"
              />
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-3 py-1 text-sm font-medium transition-colors"
              >
                Search
              </button>
            </form>

            {/* Auth Buttons */}
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="text-white/60 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  Join Free
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {isSeller ? (
                  <Link 
                    href="/seller-dashboard" 
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/browse" 
                    className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Browse
                  </Link>
                )}
                
                {/* Avatar */}
                <div className="w-8 h-8 bg-white/[0.12] border border-white/[0.20] rounded-full flex items-center justify-center">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white/60" />
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/60 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
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
            className="fixed top-20 left-4 right-4 z-40 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-6 md:hidden"
          >
            <div className="space-y-4">
              <Link href="/" className="block text-white/60 hover:text-white font-medium">
                Home
              </Link>
              <Link href="/browse" className="block text-white/60 hover:text-white font-medium">
                Browse
              </Link>
              <Link href="/categories" className="block text-white/60 hover:text-white font-medium">
                Categories
              </Link>
              <Link href="/about" className="block text-white/60 hover:text-white font-medium">
                About
              </Link>
              
              {!user ? (
                <div className="pt-4 border-t border-white/[0.12] space-y-3">
                  <Link href="/login" className="block text-white/60 hover:text-white font-medium">
                    Sign In
                  </Link>
                  <Link href="/register" className="block bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 py-2 text-center font-medium">
                    Join Free
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/[0.12]">
                  {isSeller ? (
                    <Link href="/seller-dashboard" className="block bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 py-2 text-center font-medium">
                      Dashboard
                    </Link>
                  ) : (
                    <Link href="/browse" className="block text-white/60 hover:text-white font-medium">
                      Browse Products
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
