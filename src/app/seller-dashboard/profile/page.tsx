'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MessageCircle, Facebook, Instagram, Send, Camera, Save, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileData {
  full_name: string
  phone: string
  email: string
  whatsapp: string
  facebook: string
  instagram: string
  telegram: string
  bio: string
  avatar_url: string
}

export default function SellerProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    email: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    telegram: '',
    bio: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: user.email || '',
          whatsapp: data.whatsapp || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          telegram: data.telegram || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        })
      } else {
        // Create profile if it doesn't exist
        setProfile(prev => ({
          ...prev,
          email: user.email || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setLoading(true)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-avatar.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setProfile(prev => ({
        ...prev,
        avatar_url: publicUrl
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    setSuccess(false)

    try {
      const profileData = {
        full_name: profile.full_name,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        facebook: profile.facebook,
        instagram: profile.instagram,
        telegram: profile.telegram,
        bio: profile.bio,
        avatar_url: profile.avatar_url
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      let result
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
      } else {
        // Create new profile
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...profileData
          })
      }

      if (result.error) throw result.error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#004E64] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0E5E9]/30 to-transparent">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-white/60">Manage your seller profile and contact information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Profile Photo</h3>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white/60" />
                  )}
                </div>
                <div>
                  <label className="glass px-4 py-2 rounded-xl text-white hover:bg-white/20 smooth-transition cursor-pointer inline-flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-white/60 text-sm mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white/60 bg-white/10 cursor-not-allowed"
                    placeholder="Email (read-only)"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40"
                    placeholder="+855 12 345 678"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={profile.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40"
                    placeholder="+855 12 345 678"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <Facebook className="w-4 h-4 inline mr-2" />
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={profile.facebook}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40"
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={profile.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <Send className="w-4 h-4 inline mr-2" />
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={profile.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Bio / Description</h3>
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004E64]/20 text-white placeholder-white/40 resize-none"
                placeholder="Tell customers about yourself and your business..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <div>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-green-400"
                  >
                    <Check className="w-5 h-5" />
                    <span>Profile saved successfully!</span>
                  </motion.div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="glass px-8 py-3 rounded-2xl text-[#004E64] font-semibold hover:bg-[#004E64] hover:text-white smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
