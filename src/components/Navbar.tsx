'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const isSeller = user?.user_metadata?.role === 'seller'
  const [activeLink, setActiveLink] = useState('')

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/') setActiveLink('home')
    else if (path === '/browse') setActiveLink('browse')
    else if (path === '/categories') setActiveLink('categories')
    else if (path === '/about') setActiveLink('about')
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="h-[70px] border-b border-white/[0.06] px-8 flex items-center justify-between">
      {/* LEFT - Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <span className="font-black text-white tracking-tight text-lg">NestKH</span>
        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
      </Link>

      {/* CENTER - Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <Link
          href="/"
          className={`relative text-sm font-medium transition-colors duration-200 ${
            activeLink === 'home' ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveLink('home')}
        >
          Home
          {activeLink === 'home' && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400"
            />
          )}
        </Link>
        
        <Link
          href="/browse"
          className={`relative text-sm font-medium transition-colors duration-200 ${
            activeLink === 'browse' ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveLink('browse')}
        >
          Browse
          {activeLink === 'browse' && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400"
            />
          )}
        </Link>
        
        <Link
          href="/categories"
          className={`relative text-sm font-medium transition-colors duration-200 ${
            activeLink === 'categories' ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveLink('categories')}
        >
          Categories
          {activeLink === 'categories' && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400"
            />
          )}
        </Link>
        
        <Link
          href="/about"
          className={`relative text-sm font-medium transition-colors duration-200 ${
            activeLink === 'about' ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveLink('about')}
        >
          About
          {activeLink === 'about' && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400"
            />
          )}
        </Link>
      </div>

      {/* RIGHT - Auth */}
      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link
              href="/auth/signin"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-amber-400 hover:bg-amber-500 text-black rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200"
            >
              Join Free
            </Link>
          </>
        ) : (
          <>
            {isSeller ? (
              <Link
                href="/seller-dashboard"
                className="flex items-center space-x-2 text-white/60 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/browse"
                className="flex items-center space-x-2 text-white/60 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Browse</span>
              </Link>
            )}
            
            <button
              onClick={handleSignOut}
              className="w-8 h-8 bg-white/[0.08] rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
            >
              <User className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
