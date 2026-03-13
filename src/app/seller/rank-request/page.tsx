'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RankRequestPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<number>(1)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Use the same upload API that dashboard uses
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Upload failed')
    }
    
    const data = await res.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!screenshotFile) {
      setMessage('Please select a screenshot')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('Please login to submit a rank request')
        return
      }

      // Upload screenshot to Cloudinary
      const screenshotUrl = await uploadToCloudinary(screenshotFile)

      // Insert into Supabase rank_requests table
      const { error } = await supabase.from('rank_requests').insert({
        seller_id: user.id,
        rank: selectedTier,
        status: 'pending',
        screenshot_url: screenshotUrl,
        created_at: new Date().toISOString()
      })

      if (error) {
        console.error('Error inserting rank request:', error)
        setMessage('Failed to submit rank request. Please try again.')
        return
      }

      setMessage('Rank request submitted successfully! We will review your request within 24-48 hours.')
      
      // Reset form
      setSelectedTier(1)
      setScreenshotFile(null)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Error submitting rank request:', error)
      setMessage('Failed to upload screenshot. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshotFile(file)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>🏆 Rank Request</h1>
        <p style={{ color: '#6b7280', marginBottom: '40px' }}>Submit a screenshot of your products to upgrade your seller tier.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tier Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Select Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value={1}>Tier 1 - Starter (30 products - $5/month)</option>
              <option value={2}>Tier 2 - Verified (150 products - $10/month)</option>
              <option value={3}>Tier 3 - Premium (300 products - $20/month)</option>
            </select>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Screenshot of Your Products
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            />
            {screenshotFile && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                Selected: {screenshotFile.name}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#004E64',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Rank Request'}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : '#991b1b',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            How to Submit Your Rank Request:
          </h3>
          <ol style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Take a screenshot of your product listing page showing all your products</li>
            <li style={{ marginBottom: '8px' }}>Select the tier you want to upgrade to</li>
            <li style={{ marginBottom: '8px' }}>Upload the screenshot using the form above</li>
            <li style={{ marginBottom: '8px' }}>We'll review your request within 24-48 hours</li>
            <li style={{ marginBottom: '8px' }}>Once approved, you'll be upgraded to the new tier</li>
          </ol>
        </div>

        {/* ABA Payment QR Code */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            ABA Payment
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
            Scan the QR code below to make payment for your tier upgrade. After payment, your request will be processed automatically.
          </p>
          <div style={{ 
            display: 'inline-block', 
            padding: '16px', 
            backgroundColor: '#f9fafb', 
            border: '2px dashed #d1d5db',
            borderRadius: '12px'
          }}>
            <img 
              src="/aba-qr.png" 
              alt="ABA QR Code" 
              style={{ 
                width: '200px', 
                height: '200px', 
                display: 'block'
              }} 
            />
          </div>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '12px', 
            marginTop: '16px', 
            fontStyle: 'italic'
          }}>
            Please save the QR code screenshot after payment for your records
          </p>
        </div>
      </div>
    </div>
  )
}
