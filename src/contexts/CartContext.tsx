'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  image_url?: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (product: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  showSuccessToast: (message: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)
  }, [cartItems])

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    }
  }

  const saveCart = (items: CartItem[]) => {
    setCartItems(items)
    localStorage.setItem('cart', JSON.stringify(items))
  }

  const addToCart = (product: CartItem) => {
    const existingCart = [...cartItems]
    const existingItem = existingCart.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += product.quantity
    } else {
      existingCart.push(product)
    }
    
    saveCart(existingCart)
    showSuccessToast(`${product.name} added to cart!`)
  }

  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    saveCart(updatedCart)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    )
    saveCart(updatedCart)
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 glass px-6 py-3 rounded-2xl text-white z-50 animate-pulse'
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      showSuccessToast
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
