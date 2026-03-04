'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useLang } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const isSeller = user?.user_metadata?.role === 'seller'
  const [activeLink, setActiveLink] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState('')
  const { lang, toggleLang } = useLang()

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/') setActiveLink('home')
    else if (path === '/browse') setActiveLink('browse')
    else if (path === '/categories') setActiveLink('categories')
    else if (path === '/about') setActiveLink('about')
  }, [])

  useEffect(() => {
    async function getRole() {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(data?.role || '')
    }
    getRole()
  }, [user])

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false)
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    setUserRole('')
    window.location.href = '/'
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
        width: 'calc(100% - 32px)',
        maxWidth: '700px',
        zIndex: 50,
        ...glassStyle
      }}
      className="px-4 md:px-8 py-4"
    >
      <div className="flex items-center justify-between">
        {/* LEFT - Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-black text-white tracking-tight text-lg">NestKH</span>
          <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(0,254,226,0.4)]"></div>
        </Link>

        {/* ALWAYS VISIBLE: Theme and Language Toggles */}
        <div style={{ 
          position: 'absolute', 
          right: '20px', 
          top: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          zIndex: 1000
        }}>
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '9999px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'white',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            title={lang === 'en' ? 'Switch to Khmer' : 'Switch to English'}
          >
            {lang === 'en' ? '🇰🇭' : '🇬🇧'}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* CENTER - Navigation - Hidden on mobile */}
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
          
          {/* Ranks - Only show for sellers */}
          {userRole === 'seller' && (
            <Link href="/dashboard/ranks">
              <span style={{
                color: '#E8C97E',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(232,201,126,0.1)',
                border: '1px solid rgba(232,201,126,0.2)',
                transition: 'all 0.2s'
              }}>
                🏆 Ranks
              </span>
            </Link>
          )}
          
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
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          
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
                  {/* Mobile navigation links */}
                  <div className="md:hidden border-b border-white/[0.06] pb-2 mb-2">
                    <Link 
                      href="/"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        color: activeLink === 'home' ? 'white' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Home
                    </Link>
                    <Link 
                      href="/browse"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        color: activeLink === 'browse' ? 'white' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Browse
                    </Link>
                    <Link 
                      href="/categories"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        color: activeLink === 'categories' ? 'white' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Categories
                    </Link>
                    <Link 
                      href="/about"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        color: activeLink === 'about' ? 'white' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      About
                    </Link>
                  </div>
                  
                  <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.06)', 
                    margin: '6px 0' 
                  }} />

                  {userRole === 'admin' && (
                    <Link 
                      href="/admin" 
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        color: '#E8C97E',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,201,126,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}

                  <Link 
                    href="/dashboard" 
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
              {/* Theme and Language Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Language Toggle */}
                <button
                  onClick={toggleLang}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '9999px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'white',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  title={lang === 'en' ? 'Switch to Khmer' : 'Switch to English'}
                >
                  {lang === 'en' ? '🇰🇭' : '🇬🇧'}
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />
              </div>

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
