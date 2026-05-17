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
      content: 'On signup we collect: full name, email, phone number (sellers), and role. During use we collect: listings you create, browsing activity, and device info such as IP address and browser type.'
    },
    {
      title: 'How We Use It',
      content: 'To operate your account, display listings, improve NestKH, send account notifications, and enforce our Terms. We do not sell your data to third parties.'
    },
    {
      title: 'Third Party Services',
      content: 'NestKH uses Supabase (database and auth), Cloudinary (images), and Vercel (hosting). Each processes data per their own privacy policies.'
    },
    {
      title: 'Data Retention',
      content: 'We keep your data while your account is active. On deletion request, data is removed within 30 days except where required by law. Listings may remain visible up to 7 days after deletion.'
    },
    {
      title: 'Cookies',
      content: 'We use cookies to keep you logged in and improve your experience. You may disable cookies in your browser but this may affect platform functionality.'
    },
    {
      title: 'Data Security',
      content: 'We use encrypted transmission, secure authentication, and row-level database security to protect your data. No internet transmission is 100% secure.'
    },
    {
      title: "Children's Privacy",
      content: 'NestKH allows users aged 12 and above as buyers. We do not knowingly collect data from children under 12. If you believe a child under 12 registered, contact us and we will delete their account immediately.'
    },
    {
      title: 'Your Rights',
      content: 'You may request access, correction, or deletion of your data at any time through nestkh.com.'
    },
    {
      title: 'Changes',
      content: 'We may update this policy anytime. Continued use means acceptance of changes.'
    },
    {
      title: 'Contact',
      content: 'For privacy questions or data deletion requests contact us at nestkh.com.'
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
