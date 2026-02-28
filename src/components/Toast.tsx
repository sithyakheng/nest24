'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
})

export function useToast() {
  return React.useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 3000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function ToastNotifications() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              relative backdrop-blur-xl border rounded-2xl p-4 shadow-lg
              min-w-[300px] max-w-[400px]
              ${
                toast.type === 'success' 
                  ? 'bg-teal-500/90 border-teal-400/30 shadow-[0_0_20px_rgba(0,78,100,0.4)]'
                  : toast.type === 'error'
                  ? 'bg-red-500/90 border-red-400/30 shadow-[0_0_20px_rgba(255,80,80,0.4)]'
                  : 'bg-amber-500/90 border-amber-400/30 shadow-[0_0_20px_rgba(232,201,126,0.4)]'
              }
            `}
          >
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {toast.type === 'success' && <Check className="w-5 h-5 text-white" />}
                {toast.type === 'error' && <X className="w-5 h-5 text-white" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-white" />}
              </div>
              
              <p className="text-white text-sm font-medium leading-relaxed flex-1">
                {toast.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Loading Skeleton Component
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl overflow-hidden ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-white/[0.10] rounded mb-4 w-3/4"></div>
        <div className="h-6 bg-white/[0.10] rounded mb-2"></div>
        <div className="h-4 bg-white/[0.10] rounded mb-2 w-5/6"></div>
        <div className="h-4 bg-white/[0.10] rounded"></div>
      </div>
    </div>
  )
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="font-black text-white text-xl mb-2">{title}</h3>
              <p className="text-white/60 leading-relaxed">{message}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-transparent border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.10] rounded-full px-4 py-3 font-medium transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-3 font-medium transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
