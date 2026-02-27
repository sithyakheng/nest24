'use client'

import { motion } from 'framer-motion'
import { Phone, Facebook, Instagram, MessageCircle, Mail } from 'lucide-react'

interface SellerContactButtonsProps {
  phoneNumber?: string
  facebookUrl?: string
  instagramUrl?: string
  whatsappUrl?: string
  email?: string
  className?: string
}

export default function SellerContactButtons({
  phoneNumber,
  facebookUrl,
  instagramUrl,
  whatsappUrl,
  email,
  className = ""
}: SellerContactButtonsProps) {
  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`
    }
  }

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleFacebook = () => {
    if (facebookUrl) {
      window.open(facebookUrl, '_blank')
    }
  }

  const handleInstagram = () => {
    if (instagramUrl) {
      window.open(instagramUrl, '_blank')
    }
  }

  const handleEmail = () => {
    if (email) {
      window.location.href = `mailto:${email}`
    }
  }

  const contactMethods = [
    {
      icon: Phone,
      label: 'Call',
      action: handleCall,
      available: !!phoneNumber,
      color: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400'
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      action: handleWhatsApp,
      available: !!whatsappUrl,
      color: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400'
    },
    {
      icon: Facebook,
      label: 'Facebook',
      action: handleFacebook,
      available: !!facebookUrl,
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: Instagram,
      label: 'Instagram',
      action: handleInstagram,
      available: !!instagramUrl,
      color: 'from-pink-500/20 to-pink-600/20',
      iconColor: 'text-pink-400'
    },
    {
      icon: Mail,
      label: 'Email',
      action: handleEmail,
      available: !!email,
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400'
    }
  ]

  const availableMethods = contactMethods.filter(method => method.available)

  if (availableMethods.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-white/80 font-medium mb-3">Contact Seller</h3>
      <div className="flex flex-wrap gap-3">
        {availableMethods.map((method, index) => {
          const Icon = method.icon
          return (
            <motion.button
              key={method.label}
              onClick={method.action}
              className={`glass p-3 rounded-2xl hover:scale-105 smooth-transition relative overflow-hidden group`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} rounded-2xl opacity-0 group-hover:opacity-100 smooth-transition`}></div>
              
              {/* Icon */}
              <div className="relative z-10">
                <Icon className={`w-5 h-5 ${method.iconColor}`} />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 glass rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 smooth-transition whitespace-nowrap pointer-events-none">
                {method.label}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
