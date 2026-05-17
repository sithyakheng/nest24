'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'

export default function TermsPage() {
  const [windowWidth, setWindowWidth] = useState(1200)
  const isMobile = windowWidth < 768
  
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const containerStyle = {
    minHeight: '100vh',
    background: '#ffffff',
    paddingTop: '100px',
    paddingBottom: '80px'
  }

  const contentStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: isMobile ? '40px 24px' : '60px 40px'
  }

  const sectionStyle = {
    background: '#ffffff',
    border: '1px solid #f3f4f6',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px'
  }

  const headingStyle = {
    color: '#111827',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px'
  }

  const subheadingStyle = {
    color: '#111827',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px'
  }

  const textStyle = {
    color: '#1f2937',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '16px'
  }

  const lastUpdatedStyle = {
    color: '#6b7280',
    fontSize: '14px',
    fontStyle: 'italic',
    marginBottom: '24px'
  }

  const sections = [
    {
      title: 'About NestKH',
      content: 'NestKH is a Cambodian online marketplace that connects buyers and sellers across the Kingdom of Cambodia. NestKH provides the platform only and is not a party to any transaction between buyers and sellers. NestKH does not own, sell, resell, or control any of the products or services listed on the platform.'
    },
    {
      title: 'Eligibility & Age Requirements',
      content: 'You must be at least 12 years old to register and use NestKH as a buyer. Users under 18 must have permission from a parent or legal guardian. To register as a seller, you must be at least 18 years old or have verifiable parental consent. By creating an account, you confirm you meet these age requirements.'
    },
    {
      title: 'Your Account',
      content: 'You are responsible for keeping your account credentials secure. You must provide accurate information when signing up. You may not share your account with others. NestKH reserves the right to suspend or permanently ban accounts that violate these Terms.'
    },
    {
      title: 'Sellers',
      content: 'Sellers are solely responsible for the accuracy, legality, and quality of their listings. Product limits apply by tier: Free (2), Starter (30), Verified (150), Premium (300). NestKH may remove any listing that violates these Terms or Cambodian law. Sellers must not misrepresent products or use fake images.'
    },
    {
      title: 'Buyers',
      content: 'All transactions occur directly between buyers and sellers. NestKH is not responsible for product quality, authenticity, safety, or delivery. Buyers should exercise due diligence before purchasing. NestKH recommends meeting in safe public locations for in-person transactions.'
    },
    {
      title: 'Payments & No Refunds',
      content: 'NestKH does not process or hold any payments. All payment arrangements are made directly between parties. NestKH does not offer refunds or mediate disputes. Any financial agreements are solely between buyer and seller.'
    },
    {
      title: 'No Scamming or Fraud',
      content: 'Any user found scamming or defrauding others will be permanently banned. This includes fake listings, false descriptions, taking payment without delivering, and fake accounts. Severe cases will be reported to the Royal Cambodia Police.'
    },
    {
      title: 'Prohibited Content',
      content: 'Strictly prohibited: illegal or counterfeit goods, weapons, drugs, adult content, content violating Cambodian law, spam, and fake reviews. Violations result in immediate listing removal and account termination.'
    },
    {
      title: 'Intellectual Property',
      content: 'All NestKH platform content including logos, design, and software is property of NestKH. Sellers retain ownership of their product images but grant NestKH a license to display them on the platform.'
    },
    {
      title: 'Limitation of Liability',
      content: 'NestKH is provided as-is without warranties. To the maximum extent permitted by Cambodian law, NestKH is not liable for any damages arising from use of the platform including losses from transactions or scams.'
    },
    {
      title: 'Governing Law',
      content: 'These Terms are governed by the laws of the Kingdom of Cambodia. Disputes shall be resolved in the competent courts of Phnom Penh.'
    },
    {
      title: 'Changes',
      content: 'NestKH may update these Terms at any time. Continued use means you accept updated Terms.'
    },
    {
      title: 'Contact',
      content: 'Contact us through nestkh.com for legal inquiries or to report violations.'
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
            color: '#111827', 
            fontSize: isMobile ? '32px' : '48px', 
            fontWeight: '900', 
            margin: 0 
          }}>
            Terms & Conditions
          </h1>
          <p style={{ 
            color: '#6b7280', 
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
