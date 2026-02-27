'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Store, Bell, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const { user } = useAuth()

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'store', label: 'Store', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your account and store preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass rounded-2xl p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 smooth-transition ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="glass rounded-2xl p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.user_metadata?.full_name || ''}
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
                    />
                  </div>
                  <motion.button
                    className="glass px-6 py-3 rounded-xl text-white font-medium hover:bg-white/20 smooth-transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'store' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Store Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Store Name</label>
                    <input
                      type="text"
                      placeholder="Enter your store name"
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Store Description</label>
                    <textarea
                      placeholder="Describe your store"
                      rows={4}
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition resize-none"
                    />
                  </div>
                  <motion.button
                    className="glass px-6 py-3 rounded-xl text-white font-medium hover:bg-white/20 smooth-transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Update Store
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    'New order notifications',
                    'Customer messages',
                    'Product reviews',
                    'Marketing emails'
                  ].map((item) => (
                    <label key={item} className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-white/10 smooth-transition">
                      <span className="text-white">{item}</span>
                      <input
                        type="checkbox"
                        defaultChecked={item === 'New order notifications'}
                        className="w-5 h-5 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Billing Information</h2>
                <div className="text-center py-12">
                  <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-white/60" />
                  </div>
                  <p className="text-white/60">Billing settings coming soon</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
