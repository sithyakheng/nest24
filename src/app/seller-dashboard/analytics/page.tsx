'use client'

import { useState, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Calendar, BarChart3, LineChart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  shippedOrders: number
  completedOrders: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    completedOrders: 0,
    topProducts: [],
    revenueByDay: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const { user } = useAuth()

  // Animated counters
  const animatedRevenue = useSpring(0, { stiffness: 100, damping: 30 })
  const animatedOrders = useSpring(0, { stiffness: 100, damping: 30 })
  const animatedProducts = useSpring(0, { stiffness: 100, damping: 30 })
  const animatedCustomers = useSpring(0, { stiffness: 100, damping: 30 })

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  useEffect(() => {
    animatedRevenue.set(data.totalRevenue)
    animatedOrders.set(data.totalOrders)
    animatedProducts.set(data.totalProducts)
    animatedCustomers.set(data.totalCustomers)
  }, [data])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('User not authenticated')
        return
      }

      console.log('🔍 Fetching analytics data for seller:', user.id)

      // Total products
      const { count: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)

      if (productsError) {
        console.error('❌ Products count error:', productsError)
      }

      // Total orders
      const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)

      if (ordersError) {
        console.error('❌ Orders count error:', ordersError)
      }

      // Total revenue from completed orders
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total')
        .eq('seller_id', user.id)
        .eq('status', 'completed')

      if (revenueError) {
        console.error('❌ Revenue data error:', revenueError)
      }

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      // Products with most views/orders (latest products)
      const { data: topProducts, error: topProductsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (topProductsError) {
        console.error('❌ Top products error:', topProductsError)
      }

      console.log('📊 Analytics data:', {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        topProductsCount: topProducts?.length || 0
      })

      setData({
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalCustomers: 0, // Can be calculated later if needed
        pendingOrders: 0, // Can be calculated later if needed
        shippedOrders: 0, // Can be calculated later if needed
        completedOrders: 0, // Can be calculated later if needed
        topProducts: topProducts || [],
        revenueByDay: [] // Can be calculated later if needed
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const LoadingShimmer = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="h-4 glass rounded-lg animate-pulse w-1/2 mb-4"></div>
            <div className="h-8 glass rounded-lg animate-pulse w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="h-4 glass rounded-lg animate-pulse w-1/3 mb-4"></div>
          <div className="h-64 glass rounded-lg animate-pulse"></div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="h-4 glass rounded-lg animate-pulse w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 glass rounded-lg animate-pulse w-1/2"></div>
                <div className="h-4 glass rounded-lg animate-pulse w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-white/60">Track your store performance</p>
        </motion.div>
        <LoadingShimmer />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Revenue',
      value: `$${Math.round(animatedRevenue.get()).toLocaleString()}`,
      change: data.totalRevenue > 0 ? 23 : 0,
      isUp: true,
      icon: DollarSign,
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      title: 'Orders',
      value: Math.round(animatedOrders.get()),
      change: data.totalOrders > 0 ? 12 : 0,
      isUp: true,
      icon: ShoppingCart,
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      title: 'Products',
      value: Math.round(animatedProducts.get()),
      change: data.totalProducts > 0 ? 8 : 0,
      isUp: true,
      icon: Package,
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      title: 'Customers',
      value: Math.round(animatedCustomers.get()),
      change: data.totalCustomers > 0 ? 15 : 0,
      isUp: true,
      icon: Users,
      color: 'from-orange-500/20 to-orange-600/20'
    }
  ]

  const maxRevenue = Math.max(...data.revenueByDay.map(d => d.revenue), 1)

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-white/60">Track your store performance</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="glass px-4 py-2 rounded-2xl text-white focus:outline-none smooth-transition mt-4 lg:mt-0"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass rounded-2xl p-6 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 glass rounded-xl text-[#E0E5E9]`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.change > 0 && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">{stat.change}%</span>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="text-white/60 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {data.revenueByDay.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                className="flex-1 bg-gradient-to-t from-[#E0E5E9]/40 to-[#E0E5E9]/10 rounded-t-lg relative group cursor-pointer"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 glass px-2 py-1 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 smooth-transition whitespace-nowrap">
                  ${day.revenue.toFixed(0)}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-white/60">
            <span>{data.revenueByDay[0]?.date}</span>
            <span>{data.revenueByDay[data.revenueByDay.length - 1]?.date}</span>
          </div>
        </motion.div>

        {/* Order Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Order Status</h2>
          <div className="space-y-4">
            {[
              { label: 'Pending', count: data.pendingOrders, color: 'bg-orange-500/20 text-orange-400' },
              { label: 'Shipped', count: data.shippedOrders, color: 'bg-blue-500/20 text-blue-400' },
              { label: 'Completed', count: data.completedOrders, color: 'bg-green-500/20 text-green-400' }
            ].map((status, index) => (
              <div key={status.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${status.color.split(' ')[0]}`}></div>
                  <span className="text-white/80">{status.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${status.color}`}>
                    {status.count}
                  </span>
                  <div className="w-24 h-2 glass rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.totalOrders > 0 ? (status.count / data.totalOrders) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className={`h-full ${status.color.split(' ')[0]}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass rounded-2xl p-6 mt-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Top Products</h2>
        <div className="space-y-3">
          {data.topProducts.length > 0 ? (
            data.topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/10 smooth-transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 glass rounded-lg flex items-center justify-center">
                    <span className="text-[#E0E5E9] text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-white/60 text-sm">{product.sales} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#E0E5E9] font-semibold">${product.revenue.toFixed(2)}</p>
                  <p className="text-white/60 text-sm">revenue</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/60">No sales data yet</p>
              <p className="text-white/40 text-sm mt-1">Product performance will appear here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
