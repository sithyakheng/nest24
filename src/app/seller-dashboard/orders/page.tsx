'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  product_name: string
  product_price: number
  quantity: number
  total: number
  status: 'pending' | 'shipped' | 'completed'
  created_at: string
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Mock data for now - replace with actual Supabase query
      const mockOrders: Order[] = [
        {
          id: '1',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          product_name: 'Premium Wireless Headphones',
          product_price: 89.99,
          quantity: 1,
          total: 89.99,
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          product_name: 'Smart Watch Pro',
          product_price: 299.99,
          quantity: 2,
          total: 599.98,
          status: 'shipped',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          customer_name: 'Bob Johnson',
          customer_email: 'bob@example.com',
          product_name: 'Laptop Stand',
          product_price: 49.99,
          quantity: 1,
          total: 49.99,
          status: 'completed',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm)
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium">Order ID</th>
                <th className="text-left p-4 text-white/80 font-medium">Customer</th>
                <th className="text-left p-4 text-white/80 font-medium">Product</th>
                <th className="text-left p-4 text-white/80 font-medium">Total</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Date</th>
                <th className="text-left p-4 text-white/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-white/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                    <p className="text-white/60">
                      {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Orders will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
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
                      <div>
                        <p className="text-white font-medium">{order.customer_name}</p>
                        <p className="text-white/60 text-sm">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{order.product_name}</p>
                        <p className="text-white/60 text-sm">Qty: {order.quantity}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[#E0E5E9] font-semibold">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-white/60">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <motion.button
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="glass px-3 py-1 rounded-lg text-blue-400 hover:bg-blue-500/10 smooth-transition text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Mark Shipped
                          </motion.button>
                        )}
                        {order.status === 'shipped' && (
                          <motion.button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="glass px-3 py-1 rounded-lg text-green-400 hover:bg-green-500/10 smooth-transition text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Mark Complete
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
