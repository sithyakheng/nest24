'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useLang } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  const isSeller = user?.user_metadata?.role === 'seller'
  const [activeLink, setActiveLink] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200)
  const { lang, toggleLang } = useLang()

  const navTextColor = isDark ? 'white' : '#0f172a'
  const navBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'
  const navBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const isMobile = windowWidth < 768

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleLangToggle() {
    console.log('Current lang:', lang)
    toggleLang()
    console.log('Toggled!')
  }

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
    background: navBg,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: `1px solid ${navBorder}`,
    borderTop: `1px solid ${navBorder}`,
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
        width: '98%',
        maxWidth: '1400px',
        zIndex: 50,
        ...glassStyle
      }}
      className="px-4 md:px-8 py-4"
    >
      <div className="flex items-center justify-between">
        {/* LEFT - Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span style={{ color: navTextColor, fontWeight: '900', fontSize: '20px' }}>NestKH</span>
          <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(0,254,226,0.4)]"></div>
        </Link>

        {/* CENTER - Navigation - Hidden on mobile */}
        {!isMobile && (
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`relative text-sm font-medium transition-all duration-200 ${
                activeLink === 'home' ? '' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ color: navTextColor }}
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
                activeLink === 'browse' ? '' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ color: navTextColor }}
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
              activeLink === 'categories' ? '' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ color: navTextColor }}
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
              activeLink === 'about' ? '' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ color: navTextColor }}
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

          {/* Language toggle */}
          <button
            onClick={handleLangToggle}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              color: navTextColor,
              transition: 'all 0.2s'
            }}
            title={lang === 'en' ? 'Switch to Khmer' : 'Switch to English'}
          >
            {lang === 'en' ? '🇰🇭' : '🇬🇧'}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
        )}

        {/* RIGHT - Auth */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Ranks - Only show for sellers (desktop only) */}
          {!isMobile && userRole === 'seller' && (
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

          {/* Mobile controls */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              {/* Language toggle */}
              <button
                onClick={handleLangToggle}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px',
                  color: navTextColor,
                  transition: 'all 0.2s'
                }}
                title={lang === 'en' ? 'Switch to Khmer' : 'Switch to English'}
              >
                {lang === 'en' ? '🇰🇭' : '🇬🇧'}
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Hamburger menu */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  padding: '4px'
                }}
              >
                <div style={{ 
                  width: '22px', 
                  height: '2px', 
                  background: navTextColor, 
                  borderRadius: '2px', 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  transform: mobileMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none' 
                }} />
                <div style={{ 
                  width: '22px', 
                  height: '2px', 
                  background: navTextColor, 
                  borderRadius: '2px', 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  opacity: mobileMenuOpen ? 0 : 1 
                }} />
                <div style={{ 
                  width: '22px', 
                  height: '2px', 
                  background: navTextColor, 
                  borderRadius: '2px', 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' 
                }} />
              </button>
            </div>
          )}
          
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: navBg,
                  border: `1px solid ${navBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: navTextColor
                }}
              >
                <User size={16} color={navTextColor} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  minWidth: '180px',
                  background: isDark ? 'rgba(10,12,18,0.95)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: `1px solid ${navBorder}`,
                  borderTop: `1px solid ${navBorder}`,
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
                        color: navTextColor,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = navBg}
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
                        color: navTextColor,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = navBg}
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
                        color: navTextColor,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = navBg}
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
                        color: navTextColor,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = navBg}
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
                      color: navTextColor,
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = navBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutDashboard size={14} color={navTextColor} />
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
                      color: navTextColor,
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = navBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color={navTextColor} />
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
                    <LogOut size={14} color="rgba(255,80,80,0.8)" />
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
                    background: navBg,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${navBorder}`,
                    borderRadius: '9999px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: navTextColor,
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
                style={{
                  color: navTextColor,
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                className="hover:opacity-100"
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

      {/* Mobile Sidebar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          background: isDark ? 'rgba(8,10,15,0.98)' : 'rgba(240,244,248,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid ${navBorder}`,
          zIndex: 999,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '80px 24px 40px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: navTextColor,
              fontSize: '24px',
              padding: '4px'
            }}
          >
            ×
          </button>

          {/* Logo */}
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ color: navTextColor, fontWeight: '900', fontSize: '24px' }}>NestKH</span>
            <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(0,254,226,0.4)]"></div>
          </Link>

          {/* Navigation Links with staggered animations */}
          {[
            { href: '/browse', label: 'Browse' },
            { href: '/categories', label: 'Categories' },
            { href: '/about', label: 'About' }
          ].map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                color: navTextColor,
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                border: '1px solid transparent',
                display: 'block',
                width: '100%',
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                transition: `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </Link>
          ))}

          {/* Ranks for sellers */}
          {userRole === 'seller' && (
            <Link
              href="/dashboard/ranks"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                color: '#E8C97E',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                border: '1px solid transparent',
                display: 'block',
                width: '100%',
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,201,126,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🏆 Ranks
            </Link>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: navBorder, margin: '16px 0' }} />

          {/* Auth Section */}
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: navTextColor,
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  display: 'block',
                  width: '100%',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: navTextColor,
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  display: 'block',
                  width: '100%',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.3s ease 0.25s, transform 0.3s ease 0.25s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  setMobileMenuOpen(false)
                  router.push('/')
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: 'rgba(255,80,80,0.8)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  display: 'block',
                  width: '100%',
                  background: 'transparent',
                  textAlign: 'left',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: navTextColor,
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  display: 'block',
                  width: '100%',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #E8C97E, #F0B429)',
                  color: 'black',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.3s ease 0.25s, transform 0.3s ease 0.25s'
                }}
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Dark Overlay */}
      {isMobile && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed', 
            inset: 0, 
            zIndex: 998,
            background: 'rgba(0,0,0,0.5)',
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? 'all' : 'none',
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />
      )}
    </nav>
  )
}
