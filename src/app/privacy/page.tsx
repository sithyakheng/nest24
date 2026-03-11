'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'

export default function PrivacyPage() {
  const [windowWidth, setWindowWidth] = useState(1200)
  const isMobile = windowWidth < 768
  
  // Simple theme detection based on time of day
  const isDark = new Date().getHours() >= 18 || new Date().getHours() < 6

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const containerStyle = {
    minHeight: '100vh',
    background: isDark ? '#0a0a0a' : '#ffffff',
    paddingTop: '100px',
    paddingBottom: '80px'
  }

  const contentStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: isMobile ? '40px 24px' : '60px 40px'
  }

  const sectionStyle = {
    background: isDark ? '#1a1a2e' : '#f8fafc',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px'
  }

  const headingStyle = {
    color: isDark ? '#ffffff' : '#0f172a',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px'
  }

  const subheadingStyle = {
    color: isDark ? '#ffffff' : '#0f172a',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px'
  }

  const textStyle = {
    color: isDark ? 'rgba(255,255,255,0.8)' : '#475569',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '16px'
  }

  const lastUpdatedStyle = {
    color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    marginBottom: '24px'
  }

  const sections = [
    {
      title: 'What We Collect',
      content: 'Name, email, phone number on signup. Also info about products you list or browse.'
    },
    {
      title: 'How We Use It',
      content: 'To run your account, display listings, and improve NestKH. We do not sell your data.'
    },
    {
      title: 'Third Party Services',
      content: 'NestKH uses Supabase, Cloudinary, and Vercel which may process your data.'
    },
    {
      title: 'Cookies',
      content: 'Used to keep you logged in and improve experience.'
    },
    {
      title: 'Your Rights',
      content: 'Request account and data deletion anytime by contacting us.'
    },
    {
      title: 'Contact',
      content: 'Contact us through NestKH platform.'
    }
  ]

  return (
    <div style={containerStyle}>
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={contentStyle}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            color: isDark ? '#ffffff' : '#0f172a', 
            fontSize: isMobile ? '32px' : '48px', 
            fontWeight: '900', 
            margin: 0 
          }}>
            Privacy Policy
          </h1>
          <p style={{ 
            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', 
            fontSize: '16px', 
            marginBottom: 0 
          }}>
            Last updated: March 2026
          </p>
        </div>

        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            style={sectionStyle}
          >
            <h2 style={subheadingStyle}>
              Section {index + 1}: {section.title}
            </h2>
            <p style={textStyle}>
              {section.content}
            </p>
          </motion.div>
        ))}

        <div style={lastUpdatedStyle}>
          Last updated: March 2026
        </div>
      </motion.div>
    </div>
  )
}
