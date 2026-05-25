'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hashPin, verifyPin } from '@/lib/pinHash'
import { 
  Shield, Lock, Smartphone, Zap, Activity, 
  X, ChevronRight, Check, Trash2, LogIn, 
  LogOut, AlertTriangle, Eye, EyeOff,
  Monitor, Wifi, Clock, RefreshCw
} from 'lucide-react'

interface SecurityCenterProps {
  userId: string
  profile: any
  onClose: () => void
  refreshProfile: () => Promise<void>
}

interface DeviceSession {
  id: string
  device_name: string
  browser: string
  ip_address: string
  last_active: string
  is_current: boolean
}

interface ActivityLog {
  id: string
  action: string
  device: string
  ip_address: string
  created_at: string
}

function hideIp(ip: string) {
  if (!ip) return ''
  return ip.replace(/(\d+\.\d+)\.\d+\.\d+/, '$1.xxx.xxx')
}

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function getDeviceLabel(ua: string) {
  const lower = ua.toLowerCase()
  if (/ipad|tablet/.test(lower)) return 'Tablet'
  if (/iphone|android|mobile/.test(lower)) return 'Phone'
  return 'Computer'
}

function getBrowserLabel(ua: string) {
  const lower = ua.toLowerCase()
  if (lower.includes('chrome') && !lower.includes('edge') && !lower.includes('opr')) return 'Chrome'
  if (lower.includes('safari') && !lower.includes('chrome')) return 'Safari'
  if (lower.includes('firefox')) return 'Firefox'
  if (lower.includes('edg')) return 'Edge'
  if (lower.includes('opr') || lower.includes('opera')) return 'Opera'
  return 'Browser'
}

export default function SecurityCenter({ userId, profile, onClose, refreshProfile }: SecurityCenterProps) {
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [minefieldEnabled, setMinefieldEnabled] = useState(false)
  const [minefieldMessage, setMinefieldMessage] = useState('')
  const [firewallEnabled, setFirewallEnabled] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [clearLogsLoading, setClearLogsLoading] = useState(false)
  const [pinAction, setPinAction] = useState<'none' | 'set' | 'change' | 'remove'>('none')
  const [currentPinDigits, setCurrentPinDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [newPinDigits, setNewPinDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [confirmNewPinDigits, setConfirmNewPinDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [setPinDigits, setSetPinDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [setConfirmPinDigits, setSetConfirmPinDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [savingPin, setSavingPin] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setMinefieldEnabled(profile?.minefield_enabled ?? false)
    setMinefieldMessage(profile?.minefield_message ?? '')
    setFirewallEnabled(profile?.firewall_enabled ?? false)
  }, [profile])

  useEffect(() => {
    loadDeviceSessions()
    loadActivityLogs()
  }, [])

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message)
    setToastType(type)
  }

  const loadDeviceSessions = async () => {
    setLoadingDevices(true)
    try {
      const { data, error } = await supabase
        .from('device_sessions')
        .select('id, device_name, browser, ip_address, last_active, is_current')
        .eq('user_id', userId)
        .order('last_active', { ascending: false })

      if (error) throw error
      setDeviceSessions(data || [])
    } catch (err) {
      console.error('Failed to load devices', err)
      showToast('Unable to load devices', 'error')
    } finally {
      setLoadingDevices(false)
    }
  }

  const loadActivityLogs = async () => {
    setLoadingLogs(true)
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, action, device, ip_address, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setActivityLogs(data || [])
    } catch (err) {
      console.error('Failed to load logs', err)
      showToast('Unable to load activity logs', 'error')
    } finally {
      setLoadingLogs(false)
    }
  }

  const handlePinInput = (field: string, index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const setter = field === 'current'
      ? setCurrentPinDigits
      : field === 'new'
      ? setNewPinDigits
      : field === 'confirmNew'
      ? setConfirmNewPinDigits
      : field === 'set'
      ? setSetPinDigits
      : setSetConfirmPinDigits

    const current = field === 'current'
      ? currentPinDigits
      : field === 'new'
      ? newPinDigits
      : field === 'confirmNew'
      ? confirmNewPinDigits
      : field === 'set'
      ? setPinDigits
      : setConfirmPinDigits

    const updated = [...current]
    updated[index] = value.slice(-1)
    setter(updated)
    setPinError('')

    if (value && index < 5) {
      const nextInput = document.getElementById(`${field}-${index + 1}`) as HTMLInputElement | null
      nextInput?.focus()
    }
  }

  const handlePinKeyDown = (field: string, index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      const current = field === 'current'
        ? currentPinDigits
        : field === 'new'
        ? newPinDigits
        : field === 'confirmNew'
        ? confirmNewPinDigits
        : field === 'set'
        ? setPinDigits
        : setConfirmPinDigits

      if (current[index]) {
        const setter = field === 'current'
          ? setCurrentPinDigits
          : field === 'new'
          ? setNewPinDigits
          : field === 'confirmNew'
          ? setConfirmNewPinDigits
          : field === 'set'
          ? setSetPinDigits
          : setSetConfirmPinDigits

        const updated = [...current]
        updated[index] = ''
        setter(updated)
        return
      }

      if (index > 0) {
        const previous = document.getElementById(`${field}-${index - 1}`) as HTMLInputElement | null
        previous?.focus()
      }
    }
  }

  const resetPinFields = () => {
    setCurrentPinDigits(['', '', '', '', '', ''])
    setNewPinDigits(['', '', '', '', '', ''])
    setConfirmNewPinDigits(['', '', '', '', '', ''])
    setSetPinDigits(['', '', '', '', '', ''])
    setSetConfirmPinDigits(['', '', '', '', '', ''])
  }

  const handleSavePin = async () => {
    setPinError('')
    setPinSuccess('')
    setSavingPin(true)

    try {
      if (pinAction === 'set') {
        const pin = setPinDigits.join('')
        const confirm = setConfirmPinDigits.join('')
        if (pin.length !== 6 || confirm.length !== 6) {
          setPinError('Enter all 6 digits for both fields.')
          return
        }
        if (pin !== confirm) {
          setPinError('PINs do not match.')
          return
        }
        const { error } = await supabase
          .from('profiles')
          .update({ security_pin: hashPin(pin) })
          .eq('id', userId)
        if (error) throw error
        setPinSuccess('PIN set successfully!')
        showToast('PIN set successfully!', 'success')
      }

      if (pinAction === 'change') {
        const current = currentPinDigits.join('')
        const pin = newPinDigits.join('')
        const confirm = confirmNewPinDigits.join('')
        if (current.length !== 6 || pin.length !== 6 || confirm.length !== 6) {
          setPinError('Fill all PIN fields.')
          return
        }
        if (!verifyPin(current, profile.security_pin)) {
          setPinError('Current PIN is incorrect.')
          return
        }
        if (pin !== confirm) {
          setPinError('New PINs do not match.')
          return
        }
        const { error } = await supabase
          .from('profiles')
          .update({ security_pin: hashPin(pin) })
          .eq('id', userId)
        if (error) throw error
        setPinSuccess('PIN changed successfully!')
        showToast('PIN changed successfully!', 'success')
      }

      if (pinAction === 'remove') {
        const current = currentPinDigits.join('')
        if (current.length !== 6) {
          setPinError('Enter your current PIN.')
          return
        }
        if (!verifyPin(current, profile.security_pin)) {
          setPinError('Current PIN is incorrect.')
          return
        }
        const { error } = await supabase
          .from('profiles')
          .update({ security_pin: null })
          .eq('id', userId)
        if (error) throw error
        setPinSuccess('PIN removed successfully!')
        showToast('PIN removed successfully!', 'success')
      }

      await refreshProfile()
      resetPinFields()
      setPinAction('none')
    } catch (err) {
      console.error('PIN save error', err)
      setPinError('Unable to complete PIN action.')
      showToast('Unable to complete PIN action', 'error')
    } finally {
      setSavingPin(false)
    }
  }

  const handleToggleMinefield = async (enabled: boolean) => {
    setSavingSettings(true)
    try {
      const defaultMessage = enabled && !minefieldMessage
        ? '⚠️ Alert! Someone just logged into your NestKH account. If this wasn\'t you, go to Extra Security → Active Devices and terminate the session immediately!'
        : minefieldMessage

      const { error } = await supabase
        .from('profiles')
        .update({ minefield_enabled: enabled, minefield_message: defaultMessage })
        .eq('id', userId)
      if (error) throw error
      setMinefieldEnabled(enabled)
      setMinefieldMessage(defaultMessage)
      const action = enabled ? 'Mine Field turned on' : 'Mine Field turned off'
      await supabase.from('activity_logs').insert({ user_id: userId, action, device: 'N/A', ip_address: '' })
      await refreshProfile()
      showToast(`Mine Field ${enabled ? 'enabled' : 'disabled'}`, 'success')
    } catch (err) {
      console.error('Minefield toggle error', err)
      showToast('Failed to update Mine Field', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSaveMinefieldMessage = async () => {
    setSavingSettings(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ minefield_message: minefieldMessage })
        .eq('id', userId)
      if (error) throw error
      await refreshProfile()
      showToast('Mine Field message updated', 'success')
    } catch (err) {
      console.error('Save minefield message error', err)
      showToast('Failed to save message', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleToggleFirewall = async (enabled: boolean) => {
    setSavingSettings(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ firewall_enabled: enabled })
        .eq('id', userId)
      if (error) throw error
      setFirewallEnabled(enabled)
      await refreshProfile()
      showToast(`Firewall ${enabled ? 'enabled' : 'disabled'}`, 'success')
    } catch (err) {
      console.error('Firewall toggle error', err)
      showToast('Failed to update Firewall', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const createActivityLog = async (action: string, device: string, ipAddress: string) => {
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action,
        device,
        ip_address: ipAddress
      })
      await loadActivityLogs()
    } catch (err) {
      console.error('Activity log error', err)
    }
  }

  const handleTerminateDevice = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('device_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      setDeviceSessions(prev => prev.filter((session) => session.id !== sessionId))
      alert('Device terminated!')
    } catch (err) {
      console.error('Terminate device error', err)
      showToast('Failed to terminate device', 'error')
    }
  }

  const handleClearLogs = async () => {
    setClearLogsLoading(true)
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
      setActivityLogs([])
      showToast('All logs cleared', 'success')
    } catch (err) {
      console.error('Clear logs error', err)
      showToast('Failed to clear logs', 'error')
    } finally {
      setClearLogsLoading(false)
    }
  }

  const renderPinInputs = (field: string, digits: string[]) => (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          id={`${field}-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinInput(field, index, e.target.value)}
          onKeyDown={(e) => handlePinKeyDown(field, index, e)}
          className="w-full h-14 text-center text-xl font-semibold rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
        />
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-slate-50 to-white p-8">
      <div className="mx-auto max-w-[900px]">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Shield size={24} className="text-teal-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Security Center</h1>
            </div>
            <p className="text-slate-500">Manage your account security settings</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
            <span className="text-sm font-medium">Close</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 mb-8" />

        {/* Toast */}
        {toastMessage ? (
          <div className={`mb-6 rounded-lg border p-4 ${toastType === 'success' ? 'border-teal-200 bg-teal-50 text-teal-800' : toastType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            {toastMessage}
          </div>
        ) : null}

        <div className="space-y-4">
          {/* PIN Manager Card */}
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 flex-shrink-0">
                <Lock size={20} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">PIN Manager</h2>
                <p className="text-sm text-slate-500 mt-1">Protect your account with a 6-digit PIN</p>
                
                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2">
                  {profile?.security_pin ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
                      <Check size={14} className="text-teal-600" />
                      <span className="text-xs font-medium text-teal-700">Protected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">Not Protected</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile?.security_pin ? (
                    <>
                      <button 
                        onClick={() => { setPinAction('change'); resetPinFields(); setPinError(''); setPinSuccess('') }} 
                        className="rounded-lg px-4 py-2 bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
                      >
                        Change PIN
                      </button>
                      <button 
                        onClick={() => { setPinAction('remove'); resetPinFields(); setPinError(''); setPinSuccess('') }} 
                        className="rounded-lg px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Remove PIN
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setPinAction('set'); resetPinFields(); setPinError(''); setPinSuccess('') }} 
                      className="rounded-lg px-4 py-2 bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
                    >
                      Set PIN
                    </button>
                  )}
                </div>

                {/* PIN Input Form */}
                {pinAction !== 'none' && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
                    {pinAction === 'change' && (
                      <div>
                        <p className="mb-3 text-sm text-slate-700 font-medium">Current PIN</p>
                        {renderPinInputs('current', currentPinDigits)}
                      </div>
                    )}

                    {(pinAction === 'set' || pinAction === 'change') && (
                      <>
                        <div>
                          <p className="mb-3 text-sm text-slate-700 font-medium">New PIN</p>
                          {renderPinInputs(pinAction === 'set' ? 'set' : 'new', pinAction === 'set' ? setPinDigits : newPinDigits)}
                        </div>
                        <div>
                          <p className="mb-3 text-sm text-slate-700 font-medium">Confirm PIN</p>
                          {renderPinInputs(pinAction === 'set' ? 'confirmSet' : 'confirmNew', pinAction === 'set' ? setConfirmPinDigits : confirmNewPinDigits)}
                        </div>
                      </>
                    )}

                    {pinAction === 'remove' && (
                      <div>
                        <p className="mb-3 text-sm text-slate-700 font-medium">Current PIN</p>
                        {renderPinInputs('current', currentPinDigits)}
                      </div>
                    )}

                    {pinError && <p className="text-sm text-red-600">{pinError}</p>}
                    {pinSuccess && <p className="text-sm text-teal-700">{pinSuccess}</p>}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button 
                        onClick={handleSavePin} 
                        disabled={savingPin} 
                        className="rounded-lg px-4 py-2 bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {savingPin ? 'Saving...' : pinAction === 'remove' ? 'Remove PIN' : pinAction === 'change' ? 'Save Change' : 'Save PIN'}
                      </button>
                      <button 
                        onClick={() => setPinAction('none')} 
                        type="button" 
                        className="rounded-lg px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Active Devices Card */}
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                <Smartphone size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Active Devices ({deviceSessions.length})</h2>
                <p className="text-sm text-slate-500 mt-1">See all devices logged into your account</p>
              </div>
            </div>

            <div className="space-y-2">
              {loadingDevices ? (
                <p className="text-slate-500 text-sm py-4">Loading devices...</p>
              ) : deviceSessions.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No active devices found.</p>
              ) : (
                deviceSessions.map((session) => {
                  const deviceType = session.device_name.toLowerCase().includes('phone') || session.device_name.toLowerCase().includes('tablet')
                    ? 'Mobile'
                    : 'Desktop'

                  return (
                    <div key={session.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200">
                          {deviceType === 'Mobile' ? (
                            <Smartphone size={16} className="text-slate-600" />
                          ) : (
                            <Monitor size={16} className="text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{session.browser}</p>
                          <p className="text-xs text-slate-500">{deviceType}</p>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {session.is_current ? (
                          <span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700 border border-teal-200">
                            This Device
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTerminateDevice(session.id)}
                            className="rounded-lg px-3 py-1 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Terminate
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Mine Field Card */}
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 flex-shrink-0">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Mine Field</h2>
                <p className="text-sm text-slate-500 mt-1">Show an alert when someone logs in</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">Display a custom alert message when someone logs into your account.</p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleMinefield(!minefieldEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${minefieldEnabled ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${minefieldEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-slate-600">
                  {minefieldEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {minefieldEnabled && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label className="text-sm font-medium text-slate-700">Alert Message</label>
                  <textarea 
                    value={minefieldMessage} 
                    onChange={(e) => setMinefieldMessage(e.target.value)} 
                    rows={3} 
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
                    placeholder="Enter your alert message..."
                  />
                  <button 
                    onClick={handleSaveMinefieldMessage} 
                    disabled={savingSettings}
                    className="rounded-lg px-4 py-2 bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Check size={14} />
                    Save Message
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Firewall Card */}
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 flex-shrink-0">
                <Shield size={20} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Firewall</h2>
                <p className="text-sm text-slate-500 mt-1">Block suspicious links and ads</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">Block suspicious URLs from appearing in your browsing and product descriptions on NestKH.</p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleFirewall(!firewallEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${firewallEnabled ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${firewallEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-slate-600">
                  {firewallEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {firewallEnabled && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={14} className="text-teal-600" />
                    Block suspicious URLs
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={14} className="text-teal-600" />
                    Block link shorteners (bit.ly, tinyurl)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={14} className="text-teal-600" />
                    Block script injection
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Activity Log Card */}
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 flex-shrink-0">
                <Activity size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Activity Log</h2>
                <p className="text-sm text-slate-500 mt-1">See your account activity history</p>
              </div>
              <button 
                onClick={handleClearLogs} 
                disabled={clearLogsLoading}
                className="rounded-lg px-3 py-2 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-200 flex-shrink-0"
              >
                {clearLogsLoading ? 'Clearing...' : 'Clear All'}
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loadingLogs ? (
                <p className="text-slate-500 text-sm py-4">Loading logs...</p>
              ) : activityLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Activity size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                activityLogs.map((log) => {
                  let iconColor = '#22c55e'
                  let IconComponent = LogIn
                  if (log.action.toLowerCase().includes('logout')) {
                    iconColor = '#ef4444'
                    IconComponent = LogOut
                  } else if (log.action.toLowerCase().includes('pin')) {
                    iconColor = '#f59e0b'
                    IconComponent = Lock
                  } else if (log.action.toLowerCase().includes('terminated')) {
                    iconColor = '#ef4444'
                    IconComponent = Trash2
                  }

                  return (
                    <div key={log.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex-shrink-0">
                        <IconComponent size={14} color={iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{log.action}</p>
                        <p className="text-xs text-slate-500">{log.device || 'Unknown device'}</p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDateTime(log.created_at)}
                        </div>
                        <p>{hideIp(log.ip_address)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
