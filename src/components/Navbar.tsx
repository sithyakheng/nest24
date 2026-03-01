'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const isSeller = user?.user_metadata?.role === 'seller'
  const [activeLink, setActiveLink] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/') setActiveLink('home')
    else if (path === '/browse') setActiveLink('browse')
    else if (path === '/categories') setActiveLink('categories')
    else if (path === '/about') setActiveLink('about')
  }, [])

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false)
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

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
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <User size={16} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  minWidth: '180px',
                  background: 'rgba(15,17,21,0.95)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderTop: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: '16px',
                  padding: '8px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  zIndex: 100
                }}>
                  <Link 
                    href="/seller-dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutDashboard size={14} />
                      Dashboard
                    </div>
                  </Link>

                  <Link 
                    href="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} />
                      Profile
                    </div>
                  </Link>

                  <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.06)', 
                    margin: '6px 0' 
                  }} />

                  <div
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setDropdownOpen(false)
                      router.push('/')
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      color: 'rgba(255,80,80,0.8)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white/60 hover:text-white text-sm font-medium transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
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
          )}
        </div>
      </div>
    </nav>
  )
}
