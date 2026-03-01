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

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderTop: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '9999px'
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'fit-content',
        minWidth: '700px',
        zIndex: 50,
        ...glassStyle
      }}
      className="px-8 py-4"
    >
      <div className="flex items-center justify-between">
        {/* LEFT - Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-black text-white tracking-tight text-lg">NestKH</span>
          <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(0,254,226,0.4)]"></div>
        </Link>

        {/* CENTER - Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`relative text-sm font-medium transition-all duration-200 ${
              activeLink === 'home' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveLink('home')}
          >
            Home
            {activeLink === 'home' && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_rgba(0,254,226,0.3)]"
              />
            )}
          </Link>
          
          <Link
            href="/browse"
            className={`relative text-sm font-medium transition-all duration-200 ${
              activeLink === 'browse' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveLink('browse')}
          >
            Browse
            {activeLink === 'browse' && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_rgba(0,254,226,0.3)]"
              />
            )}
          </Link>
          
          <Link
            href="/categories"
            className={`relative text-sm font-medium transition-all duration-200 ${
              activeLink === 'categories' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveLink('categories')}
          >
            Categories
            {activeLink === 'categories' && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_rgba(0,254,226,0.3)]"
              />
            )}
          </Link>
          
          <Link
            href="/about"
            className={`relative text-sm font-medium transition-all duration-200 ${
              activeLink === 'about' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveLink('about')}
          >
            About
            {activeLink === 'about' && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_rgba(0,254,226,0.3)]"
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
                className="text-white/60 hover:text-white text-sm font-medium transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-center"
                style={{
                  background: 'linear-gradient(135deg, #E8C97E, #F0B429)',
                  color: 'black',
                  fontWeight: 'bold',
                  borderRadius: '9999px',
                  padding: '8px 20px',
                  width: 'auto',
                  boxShadow: '0 4px 20px rgba(232, 201, 126, 0.3)'
                }}
              >
                Join Free
              </Link>
            </>
          ) : (
            <>
              {isSeller ? (
                <Link
                  href="/seller-dashboard"
                  className="flex items-center space-x-2 text-white/60 hover:text-white text-sm font-medium transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/browse"
                  className="flex items-center space-x-2 text-white/60 hover:text-white text-sm font-medium transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Browse</span>
                </Link>
              )}
              
              <button
                onClick={handleSignOut}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <User className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
