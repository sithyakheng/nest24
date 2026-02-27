'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ProductFormData {
  name: string
  description: string
  category: string
  price: string
  stock: string
  discount: string
  images: File[]
}

const categories = [
  'Home Living',
  'Tech Essentials',
  'Fashion',
  'Accessories',
  'Sports & Outdoors',
  'Books & Media',
  'Food & Beverages',
  'Health & Beauty'
]

export default function AddProduct() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    discount: '',
    images: []
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    )

    if (validFiles.length !== files.length) {
      setError('Some files were invalid. Please upload only images under 5MB.')
      return
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }))

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        throw new Error('You must be logged in to add a product')
      }

      // Upload images
      const imageUrls = []
      for (const image of formData.images) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const { data, error } = await supabase.storage
          .from('Product')
          .upload(fileName, image)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('Product')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      // Create product using authenticated user's ID
      const { error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          discount: formData.discount ? parseFloat(formData.discount) : null,
          image_url: imageUrls[0] || null,
          seller_id: authUser.id  // Use authenticated user's ID
        })

      if (productError) throw productError

      setSuccess(true)
      setTimeout(() => {
        router.push('/seller-dashboard/products')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Add New Product</h1>
        <p className="text-white/60">List a new item in your NestKH store</p>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 mb-6 border border-green-500/30 bg-green-500/10"
        >
          <p className="text-green-400 font-medium">Product published successfully! Redirecting...</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 mb-6 border border-red-500/30 bg-red-500/10"
        >
          <p className="text-red-400 font-medium">{error}</p>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              placeholder="Enter product name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Category</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 glass rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition bg-transparent"
            >
              <option value="" className="bg-[#004E64]">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-[#004E64]">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-white/80 font-medium mb-2">Product Description</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition resize-none"
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Price ($)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              placeholder="0"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#E0E5E9]/50 smooth-transition"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-white/80 font-medium mb-2">Product Images</label>
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass rounded-2xl p-8 border-2 border-dashed smooth-transition cursor-pointer ${
              isDragging 
                ? 'border-[#E0E5E9]/50 bg-[#E0E5E9]/10' 
                : 'border-white/30 hover:border-white/50'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 font-medium mb-2">
                Drag & drop images here or click to browse
              </p>
              <p className="text-white/60 text-sm">
                Upload up to 5 images (max 5MB each)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <motion.button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 glass rounded-lg opacity-0 group-hover:opacity-100 smooth-transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full glass px-8 py-4 rounded-2xl text-white font-semibold hover:bg-white/20 smooth-transition flex items-center justify-center space-x-2 relative overflow-hidden group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98, y: 0 }}
        >
          <span className="relative z-10">
            {loading ? 'Publishing...' : 'Publish Product'}
          </span>
          {!loading && <Plus className="w-5 h-5 relative z-10" />}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
        </motion.button>
      </motion.form>
    </div>
  )
}
