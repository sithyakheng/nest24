'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Package, Truck, CheckCircle, Clock, User, Mail, Calendar, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Order {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  total: number
  status: 'pending' | 'shipped' | 'completed'
  created_at: string
  buyer?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
    }
  }
  product?: {
    id: string
    name: string
    price: number
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchOrders()
    
    // Set up real-time subscription for orders
    const subscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrders() // Refresh all orders
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user?.id])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('User not authenticated')
        return
      }

      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId)
    try {
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('User not authenticated')
        return
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .eq('seller_id', authUser.id) // Ensure user can only update their own orders

      if (error) throw error

      // Update local state immediately for responsiveness
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.buyer?.user_metadata?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.buyer?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.product?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm)
    
    const matchesStatus = !statusFilter || order.status === statusFilter
    
    const matchesDate = !dateFilter || 
      new Date(order.created_at).toISOString().split('T')[0] === dateFilter
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: {
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        icon: Clock,
        label: 'Pending'
      },
      shipped: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: Truck,
        label: 'Shipped'
      },
      completed: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle,
        label: 'Completed'
      }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    )
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const LoadingShimmer = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass rounded-xl p-4">
          <div className="flex space-x-4">
            <div className="w-8 h-8 glass rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 glass rounded-lg animate-pulse w-3/4"></div>
              <div className="h-3 glass rounded-lg animate-pulse w-1/2"></div>
            </div>
            <div className="h-6 glass rounded-lg animate-pulse w-20"></div>
          </div>
        </div>
      ))}
    </div>
  )

  if (loading && orders.length === 0) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-white/60">Manage customer orders and fulfillment</p>
        </motion.div>
        <LoadingShimmer />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-white/60">Manage customer orders and fulfillment</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-[#E0E5E9]/50 smooth-transition"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#E0E5E9]/50 smooth-transition appearance-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#E0E5E9]/50 smooth-transition appearance-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Orders Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        {[
          { label: 'Total Orders', count: orders.length, color: 'from-blue-500/20 to-blue-600/20' },
          { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'from-orange-500/20 to-orange-600/20' },
          { label: 'Completed', count: orders.filter(o => o.status === 'completed').length, color: 'from-green-500/20 to-green-600/20' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`glass rounded-2xl p-4 relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl`}></div>
            <div className="relative z-10">
              <p className="text-white/60 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.count}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium">Order ID</th>
                <th className="text-left p-4 text-white/80 font-medium">Customer</th>
                <th className="text-left p-4 text-white/80 font-medium">Product</th>
                <th className="text-left p-4 text-white/80 font-medium">Qty</th>
                <th className="text-left p-4 text-white/80 font-medium">Total</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Date</th>
                <th className="text-left p-4 text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-12">
                    <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-white/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                    <p className="text-white/60">
                      {searchTerm || statusFilter || dateFilter ? 'Try adjusting your filters' : 'Orders will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const { date, time } = formatDateTime(order.created_at)
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                      className="border-b border-white/10 hover:bg-white/5 smooth-transition"
                    >
                      <td className="p-4">
                        <span className="text-white font-medium">#{order.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {order.buyer?.user_metadata?.full_name || 'Unknown Buyer'}
                            </p>
                            <p className="text-white/60 text-sm flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {order.buyer?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{order.product?.name || 'Unknown Product'}</p>
                          <p className="text-white/60 text-sm">${order.product?.price || 0} each</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white/80">{order.quantity}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#E0E5E9] font-semibold">${order.total.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white/60 text-sm">{date}</p>
                          <p className="text-white/40 text-xs">{time}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <motion.button
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              disabled={updatingOrderId === order.id}
                              className="glass px-3 py-1 rounded-lg text-blue-400 hover:bg-blue-500/10 smooth-transition text-sm disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {updatingOrderId === order.id ? 'Updating...' : 'Mark Shipped'}
                            </motion.button>
                          )}
                          {order.status === 'shipped' && (
                            <motion.button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              disabled={updatingOrderId === order.id}
                              className="glass px-3 py-1 rounded-lg text-green-400 hover:bg-green-500/10 smooth-transition text-sm disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {updatingOrderId === order.id ? 'Updating...' : 'Mark Complete'}
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
