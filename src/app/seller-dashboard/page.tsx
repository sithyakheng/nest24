'use client'

import { useState, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
  pendingOrders: number
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const animatedStats = {
    totalProducts: useSpring(0, { stiffness: 100, damping: 30 }),
    totalOrders: useSpring(0, { stiffness: 100, damping: 30 }),
    revenue: useSpring(0, { stiffness: 100, damping: 30 }),
    pendingOrders: useSpring(0, { stiffness: 100, damping: 30 })
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    animatedStats.totalProducts.set(stats.totalProducts)
    animatedStats.totalOrders.set(stats.totalOrders)
    animatedStats.revenue.set(stats.revenue)
    animatedStats.pendingOrders.set(stats.pendingOrders)
  }, [stats])

  const fetchDashboardStats = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)

      // Fetch orders count and revenue (mock data for now)
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)

      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)
        .eq('status', 'pending')

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        revenue: 12580, // Mock revenue data
        pendingOrders: pendingCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
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

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((order) => (
              <div key={order} className="flex items-center justify-between p-3 glass rounded-xl">
                <div>
                  <p className="text-white font-medium">Order #{1000 + order}</p>
                  <p className="text-white/60 text-sm">2 items • $89.99</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                  Completed
                </div>
              </div>
            ))}
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
