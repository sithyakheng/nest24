'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'

export default function TermsPage() {
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
      title: 'About NestKH',
      content: 'NestKH is a Cambodian online marketplace connecting buyers and sellers. We provide platform only and are not a party to any transaction.'
    },
    {
      title: 'Your Account',
      content: 'You are responsible for keeping your account secure. Provide accurate info when signing up. We reserve the right to suspend accounts that violate these terms.'
    },
    {
      title: 'Sellers',
      content: 'Sellers are responsible for their listings. Product limits apply based on tier (Free: 2, Starter: 30, Verified: 150, Premium: 300). We can remove any listing that violates our rules.'
    },
    {
      title: 'Buyers',
      content: 'All transactions happen directly between buyers and sellers. NestKH is not responsible for product quality, safety, or delivery.'
    },
    {
      title: 'No Refunds',
      content: 'NestKH does not process payments and does not offer refunds. All sales are final and handled between buyer and seller.'
    },
    {
      title: 'No Scamming or Fraud',
      content: 'Any user found scamming or defrauding others will be permanently banned. This includes fake listings, false descriptions, and taking payment without delivering. Severe cases will be reported to authorities.'
    },
    {
      title: 'Prohibited Content',
      content: 'No illegal, counterfeit, or harmful products. Spam, fraud, or abuse results in immediate removal.'
    },
    {
      title: 'Changes',
      content: 'We may update these terms anytime. Continued use means you accept updated terms.'
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
            Terms & Conditions
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
