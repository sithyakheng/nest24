'use client'

import { useState, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, TrendingDown, Phone, Facebook, Instagram, MessageCircle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
  pendingOrders: number
}

interface ContactInfo {
  phone_number: string
  facebook_url: string
  instagram_url: string
  whatsapp_url: string
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0
  })
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone_number: '',
    facebook_url: '',
    instagram_url: '',
    whatsapp_url: ''
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingContact, setSavingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const { user } = useAuth()

  const animatedStats = {
    totalProducts: useSpring(0, { stiffness: 100, damping: 30 }),
    totalOrders: useSpring(0, { stiffness: 100, damping: 30 }),
    revenue: useSpring(0, { stiffness: 100, damping: 30 }),
    pendingOrders: useSpring(0, { stiffness: 100, damping: 30 })
  }

  useEffect(() => {
    fetchDashboardStats()
    fetchContactInfo()
  }, [])

  useEffect(() => {
    animatedStats.totalProducts.set(stats.totalProducts)
    animatedStats.totalOrders.set(stats.totalOrders)
    animatedStats.revenue.set(stats.revenue)
    animatedStats.pendingOrders.set(stats.pendingOrders)
  }, [stats])

  const fetchDashboardStats = async () => {
    try {
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('User not authenticated')
        return
      }

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', authUser.id)

      // Fetch real orders data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id (
            id,
            email,
            user_metadata
          ),
          product:product_id (
            id,
            name,
            price
          )
        `)
        .eq('seller_id', authUser.id)

      if (ordersError) throw ordersError

      // Calculate real revenue from orders
      const totalRevenue = ordersData?.reduce((sum, order) => {
        return sum + (order.total || 0)
      }, 0) || 0

      // Count pending orders
      const pendingCount = ordersData?.filter(order => order.status === 'pending').length || 0

      // Get recent orders (last 3)
      const recent = ordersData?.slice(0, 3).map(order => ({
        id: order.id,
        buyerName: order.buyer?.user_metadata?.full_name || order.buyer?.email || 'Unknown Buyer',
        productName: order.product?.name || 'Unknown Product',
        total: order.total || 0,
        status: order.status || 'pending',
        date: order.created_at
      })) || []

      setRecentOrders(recent)

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersData?.length || 0,
        revenue: totalRevenue,
        pendingOrders: pendingCount
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContactInfo = async () => {
    try {
      const { data } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('seller_id', user?.id)
        .single()

      if (data) {
        setContactInfo({
          phone_number: data.phone_number || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          whatsapp_url: data.whatsapp_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
    setContactSuccess(false)
  }

  const saveContactInfo = async () => {
    setSavingContact(true)
    try {
      const { error } = await supabase
        .from('seller_profiles')
        .upsert({
          seller_id: user?.id,
          phone_number: contactInfo.phone_number,
          facebook_url: contactInfo.facebook_url,
          instagram_url: contactInfo.instagram_url,
          whatsapp_url: contactInfo.whatsapp_url
        })

      if (error) throw error

      setContactSuccess(true)
      setTimeout(() => setContactSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving contact info:', error)
    } finally {
      setSavingContact(false)
    }
  }

  const statCards = [
    {
      title: 'Total Products',
      value: Math.round(animatedStats.totalProducts.get()),
      icon: Package,
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400',
      trend: { value: 12, isUp: true }
    },
    {
      title: 'Total Orders',
      value: Math.round(animatedStats.totalOrders.get()),
      icon: ShoppingCart,
      color: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400',
      trend: { value: 8, isUp: true }
    },
    {
      title: 'Revenue',
      value: `$${Math.round(animatedStats.revenue.get()).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400',
      trend: { value: 23, isUp: true }
    },
    {
      title: 'Pending Orders',
      value: Math.round(animatedStats.pendingOrders.get()),
      icon: Clock,
      color: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-400',
      trend: { value: 5, isUp: false }
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.user_metadata?.full_name || 'Seller'}
        </h1>
        <p className="text-white/60">Here's what's happening with your store today</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass rounded-2xl p-6 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-2xl`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 glass rounded-xl ${card.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {card.trend.isUp ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${card.trend.isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {card.trend.value}%
                    </span>
                  </div>
                </div>
                <h3 className="text-white/60 text-sm mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Contact Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.01, y: -3 }}
        className="glass rounded-[24px] p-6 relative overflow-hidden"
      >
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E0E5E9]/5 to-transparent rounded-[24px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Contact Information</h2>
              <p className="text-white/60 text-sm">Let buyers reach you directly</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <Phone className="w-6 h-6 text-[#E0E5E9]" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <label className="block text-white/80 font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={contactInfo.phone_number}
                onChange={(e) => handleContactChange('phone_number', e.target.value)}
                placeholder="+855 12 345 678"
                className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-white/80 font-medium mb-2">WhatsApp</label>
              <input
                type="url"
                value={contactInfo.whatsapp_url}
                onChange={(e) => handleContactChange('whatsapp_url', e.target.value)}
                placeholder="https://wa.me/1234567890"
                className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-white/80 font-medium mb-2">Facebook URL</label>
              <input
                type="url"
                value={contactInfo.facebook_url}
                onChange={(e) => handleContactChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-white/80 font-medium mb-2">Instagram URL</label>
              <input
                type="url"
                value={contactInfo.instagram_url}
                onChange={(e) => handleContactChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourusername"
                className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <motion.button
              onClick={saveContactInfo}
              disabled={savingContact}
              className="glass px-6 py-3 rounded-2xl text-white font-semibold hover:bg-[#E0E5E9]/20 smooth-transition flex items-center space-x-2 relative overflow-hidden group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
            >
              {contactSuccess ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Updated Successfully</span>
                </>
              ) : (
                <>
                  <span>{savingContact ? 'Updating...' : 'Update Contact Info'}</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#E0E5E9]/10 to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 glass rounded-xl">
                  <div>
                    <p className="text-white font-medium">{order.buyerName}</p>
                    <p className="text-white/60 text-sm">{order.productName} • ${order.total.toFixed(2)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm ${
                    order.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400'
                      : order.status === 'shipped'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No orders yet</p>
                <p className="text-white/40 text-sm mt-1">Orders will appear here when buyers purchase your products</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 glass rounded-xl text-left hover:bg-white/10 smooth-transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">Add New Product</p>
                  <p className="text-white/60 text-sm">List a new item in your store</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 glass rounded-xl text-left hover:bg-white/10 smooth-transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">View Orders</p>
                  <p className="text-white/60 text-sm">Manage customer orders</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 glass rounded-xl text-left hover:bg-white/10 smooth-transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">View Analytics</p>
                  <p className="text-white/60 text-sm">Track your performance</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
