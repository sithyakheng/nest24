'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface SellerLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  { href: '/seller-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller-dashboard/products', label: 'My Products', icon: Package },
  { href: '/seller-dashboard/add-product', label: 'Add Product', icon: PlusCircle },
  { href: '/seller-dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/seller-dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/seller-dashboard/settings', label: 'Settings', icon: Settings },
]

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const signOut = () => supabase.auth.signOut()
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const backgroundX = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 })
  const backgroundY = useSpring(useTransform(mouseY, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX.set(clientX / innerWidth)
      mouseY.set(clientY / innerHeight)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E64] via-[#004E64]/90 to-[#003a47] relative overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-[#E0E5E9]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#004E64]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#E0E5E9]/5 rounded-full blur-2xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="hidden lg:flex w-64 flex-col glass border-r border-white/10"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">NESTKH</h1>
            <p className="text-white/60 text-sm">Seller Dashboard</p>
          </div>
          
          <nav className="flex-1 px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl mb-2 smooth-transition ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg shadow-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-white/10">
            <motion.button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 smooth-transition w-full"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="glass p-3 rounded-2xl text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: mobileMenuOpen ? 0 : -300 }}
          className="lg:hidden fixed top-0 left-0 w-64 h-full glass border-r border-white/10 z-40"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white">NESTKH</h1>
            <p className="text-white/60 text-sm">Seller Dashboard</p>
          </div>
          
          <nav className="flex-1 px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl mb-2 smooth-transition ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg shadow-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-white/10">
            <motion.button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 smooth-transition w-full"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
