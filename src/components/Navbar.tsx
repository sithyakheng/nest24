'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, LayoutDashboard, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const isSeller = user?.user_metadata?.role === 'seller'
  const [activeLink, setActiveLink] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200)
  const { lang, toggleLang, t } = useLang()

  // Fixed light theme colors
  const navTextColor = '#0f172a'
  const navBg = 'rgba(255,255,255,0.9)'
  const navBorder = 'rgba(0,0,0,0.1)'
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
      if (!user) {
        setUserRole('')
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      console.log('User role loaded:', data?.role)
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
    <>
      {/* Desktop Navbar - Only show on desktop */}
      {!isMobile && (
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
              <span style={{ 
                color: navTextColor, 
                fontWeight: '900', 
                fontSize: '22px',
                cursor: 'pointer',
                letterSpacing: '-0.02em'
              }}>
                NestKH<span style={{ color: '#4DB8CC' }}>.</span>
              </span>
              <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(0,254,226,0.4)]"></div>
            </Link>

            {/* CENTER - Navigation */}
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
                {t('nav.browse')}
                {activeLink === 'browse' && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_rgba(0,254,226,0.3)]"
                  />
                )}
              </Link>
              
              <Link href="/ranks">
                <span className="bg-[#004E64] text-white rounded-full px-4 py-1.5 text-sm font-medium">
                  🏆 Ranks
                </span>
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
                    🏆 {t('nav.ranks')}
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
                {t('nav.categories')}
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
                {t('nav.about')}
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
            </div>

            {/* RIGHT - Auth */}
            <div className="flex items-center space-x-2 md:space-x-4">
              
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: `1px solid ${navBorder}`,
                      borderRadius: '16px',
                      padding: '8px',
                      minWidth: '200px',
                      zIndex: 1000,
                      color: navTextColor
                    }}>
                      {/* Dashboard - Only show for sellers */}
                      {userRole === 'seller' && (
                        <Link href="/dashboard" style={{ display: 'block', padding: '12px 16px', color: navTextColor, textDecoration: 'none', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <LayoutDashboard size={16} />
                            <span>{t('nav.dashboard')}</span>
                          </div>
                        </Link>
                      )}
                      <Link href="/profile" style={{ display: 'block', padding: '12px 16px', color: navTextColor, textDecoration: 'none', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <User size={16} />
                          <span>{t('nav.my_account')}</span>
                        </div>
                      </Link>
                      {userRole === 'admin' && (
                        <Link href="/admin" style={{ display: 'block', padding: '12px 16px', color: navTextColor, textDecoration: 'none', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px' }}>⚙️</span>
                            <span>{t('nav.admin')}</span>
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,80,80,0.8)',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '14px'
                        }}
                      >
                        <LogOut size={16} />
                        {t('nav.signout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    {t('nav.signin')}
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
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Floating Tab Button + Sidebar */}
      {isMobile && (
        <>
          {/* Floating Left Tab Button */}
          <div
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              position: 'fixed',
              left: mobileMenuOpen ? '280px' : '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
              background: 'rgba(0,78,100,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,78,100,0.6)',
              borderLeft: mobileMenuOpen ? '1px solid rgba(0,78,100,0.6)' : 'none',
              borderRadius: mobileMenuOpen ? '0 12px 12px 0' : '0 12px 12px 0',
              padding: '16px 8px',
              cursor: 'pointer',
              transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '900',
              transition: 'transform 0.3s ease',
              display: 'block',
              transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ›
            </span>
          </div>

          {/* Mobile Sidebar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '280px',
            background: 'rgba(240,244,248,0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(0,0,0,0.1)',
            zIndex: 999,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto'
          }}>
            {/* Logo at top */}
            <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <p style={{ color: navTextColor, fontWeight: '900', fontSize: '22px', margin: '0 0 4px 0' }}>
                NestKH<span style={{ color: '#4DB8CC' }}>.</span>
              </p>
              <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '12px', margin: 0 }}>{t('home.badge')}</p>
            </div>

            {/* Language toggle */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button onClick={handleLangToggle} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '20px' }}>
                {lang === 'en' ? '🇰🇭' : '🇬🇧'}
              </button>
            </div>

            {/* Nav links */}
            {[
              { label: `🏠 Home`, href: '/' },
              { label: `🔍 ${t('nav.browse')}`, href: '/browse' },
              { label: `🏆 Ranks`, href: '/ranks' },
              { label: `📂 ${t('nav.categories')}`, href: '/categories' },
              { label: `📖 ${t('nav.about')}`, href: '/about' },
            ].map((item, index) => (
              <Link href={item.href} key={item.label} onClick={() => setMobileMenuOpen(false)}>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: navTextColor,
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: `1px solid transparent`,
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.3s ease ${index * 0.05 + 0.1}s, transform 0.3s ease ${index * 0.05 + 0.1}s` 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.label}
                </div>
              </Link>
            ))}

            {/* Ranks if seller */}
            {userRole === 'seller' && (
              <Link href="/dashboard/ranks" onClick={() => setMobileMenuOpen(false)}>
                <div style={{ padding: '14px 16px', borderRadius: '12px', color: '#E8C97E', fontSize: '15px', fontWeight: '700', cursor: 'pointer', background: 'rgba(232,201,126,0.08)', border: '1px solid rgba(232,201,126,0.15)', marginTop: '4px' }}>
                  🏆 {t('nav.ranks')}
                </div>
              </Link>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '12px 0' }} />

            {/* Auth section */}
            {user ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '700', fontSize: '16px' }}>
                    {(user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: navTextColor, fontWeight: '700', fontSize: '14px', margin: 0 }}>{t('nav.my_account')}</p>
                    <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '12px', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                {userRole === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      color: '#E8C97E',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: 'rgba(232,201,126,0.08)',
                      border: '1px solid rgba(232,201,126,0.15)',
                      marginTop: '4px'
                    }}>
                      ⚙️ {t('nav.admin')}
                    </div>
                  </Link>
                )}
                {userRole === 'seller' && (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <div style={{ padding: '12px 16px', borderRadius: '12px', color: navTextColor, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>📊 Dashboard</div>
                  </Link>
                )}
                <div
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                  style={{ padding: '12px 16px', borderRadius: '12px', color: '#f87171', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                >
                  🚪 {t('nav.signout')}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ padding: '14px 16px', borderRadius: '12px', color: navTextColor, fontSize: '15px', fontWeight: '600', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.12)', textAlign: 'center' }}>
                    {t('nav.signin')}
                  </div>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ padding: '14px 16px', borderRadius: '12px', color: 'black', fontSize: '15px', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #E8C97E, #F0B429)', textAlign: 'center' }}>
                    {t('nav.register')}
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998,
              background: 'rgba(0,0,0,0.5)',
              opacity: mobileMenuOpen ? 1 : 0,
              pointerEvents: mobileMenuOpen ? 'all' : 'none',
              transition: 'opacity 0.4s ease'
            }}
          />
        </>
      )}
    </>
  )
}
