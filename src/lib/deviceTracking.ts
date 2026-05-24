import { supabase } from '@/lib/supabase'

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return ''
  return btoa(navigator.userAgent + screen.width + screen.height)
}

export function getBrowserName(): string {
  if (typeof window === 'undefined') return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Chrome') && !ua.includes('Edge') && !ua.includes('Opera')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  return 'Unknown Browser'
}

export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'Desktop'
  return /Mobile|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
}

export async function saveDeviceSession(userId: string) {
  if (typeof window === 'undefined') return

  try {
    const deviceFingerprint = getDeviceFingerprint()
    const browserName = getBrowserName()
    const deviceType = getDeviceType()

    // Check if this device already exists
    const { data: existing } = await supabase
      .from('device_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('device_name', deviceFingerprint)
      .single()

    const isNewDevice = !existing

    if (isNewDevice) {
      // New device - add to sessions
      await supabase.from('device_sessions').insert({
        user_id: userId,
        device_name: deviceFingerprint,
        browser: `${browserName} on ${deviceType}`,
        ip_address: '0.0.x.x',
        is_current: true,
        last_active: new Date().toISOString()
      })

      // Mark that we should show mine field if enabled
      sessionStorage.setItem('is_new_device', 'true')
    } else {
      // Existing device - just update last_active
      await supabase
        .from('device_sessions')
        .update({
          last_active: new Date().toISOString(),
          is_current: true
        })
        .eq('id', existing.id)

      // Mark that this is NOT a new device
      sessionStorage.setItem('is_new_device', 'false')
    }
  } catch (err) {
    console.error('Error saving device session:', err)
  }
}
