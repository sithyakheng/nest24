'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hashPin, verifyPin } from '@/lib/pinHash'
import { AlertTriangle, Check, Globe, Lock, Phone, Shield, Trash2, User, X } from 'lucide-react'

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
      const { error } = await supabase
        .from('profiles')
        .update({ minefield_enabled: enabled })
        .eq('id', userId)
      if (error) throw error
      setMinefieldEnabled(enabled)
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
      const session = deviceSessions.find((entry) => entry.id === sessionId)
      if (!session) return
      const { error } = await supabase
        .from('device_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)
      if (error) throw error
      showToast('Device removed', 'success')
      await createActivityLog('Device was terminated', `${session.device_name} / ${session.browser}`, session.ip_address)
      await loadDeviceSessions()
    } catch (err) {
      console.error('Terminate device error', err)
      showToast('Failed to remove device', 'error')
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
    <div className="fixed inset-0 z-50 overflow-auto bg-white p-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-2 text-teal-700 text-sm font-semibold mb-3">
              <Shield className="w-4 h-4" /> Security Center
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Extra Security for Sellers</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">Manage PIN, active devices, mine field alerts, firewall protection, and your latest account activity.</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {toastMessage ? (
          <div className={`mb-4 rounded-2xl border p-4 ${toastType === 'success' ? 'border-teal-200 bg-teal-50 text-teal-800' : toastType === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            {toastMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-teal-700 font-semibold">🔐 PIN Manager</p>
                <h2 className="text-xl font-bold text-slate-900">Protect your account with a 6 digit PIN</h2>
              </div>
            </div>
            <div className="space-y-4">
              {profile?.security_pin ? (
                <div className="space-y-3">
                  <p className="text-slate-600">A security PIN is currently active. You can change it or remove it completely.</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => { setPinAction('change'); resetPinFields(); setPinError(''); setPinSuccess('') }} className="rounded-full bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700">Change PIN</button>
                    <button onClick={() => { setPinAction('remove'); resetPinFields(); setPinError(''); setPinSuccess('') }} className="rounded-full bg-red-500 px-4 py-2 text-white font-semibold hover:bg-red-600">Remove PIN</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-600">No PIN is set yet.</p>
                  <button onClick={() => { setPinAction('set'); resetPinFields(); setPinError(''); setPinSuccess('') }} className="rounded-full bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700">Set PIN</button>
                </div>
              )}

              {pinAction !== 'none' && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="space-y-4">
                    {pinAction === 'change' && (
                      <div>
                        <p className="mb-2 text-sm text-slate-700 font-semibold">Current PIN</p>
                        {renderPinInputs('current', currentPinDigits)}
                      </div>
                    )}

                    {(pinAction === 'set' || pinAction === 'change') && (
                      <>
                        <div>
                          <p className="mb-2 text-sm text-slate-700 font-semibold">New PIN</p>
                          {renderPinInputs(pinAction === 'set' ? 'set' : 'new', pinAction === 'set' ? setPinDigits : newPinDigits)}
                        </div>
                        <div>
                          <p className="mb-2 text-sm text-slate-700 font-semibold">Confirm PIN</p>
                          {renderPinInputs(pinAction === 'set' ? 'confirmSet' : 'confirmNew', pinAction === 'set' ? setConfirmPinDigits : confirmNewPinDigits)}
                        </div>
                      </>
                    )}

                    {pinAction === 'remove' && (
                      <div>
                        <p className="mb-2 text-sm text-slate-700 font-semibold">Current PIN</p>
                        {renderPinInputs('current', currentPinDigits)}
                      </div>
                    )}

                    {pinError && <p className="text-sm text-rose-600">{pinError}</p>}
                    {pinSuccess && <p className="text-sm text-emerald-700">{pinSuccess}</p>}

                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleSavePin} disabled={savingPin} className="rounded-full bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70">
                        {savingPin ? 'Saving...' : pinAction === 'remove' ? 'Remove PIN' : pinAction === 'change' ? 'Save Change' : 'Save PIN'}
                      </button>
                      <button onClick={() => setPinAction('none')} type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 font-semibold hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-teal-700 font-semibold">📱 Active Devices</p>
                <h2 className="text-xl font-bold text-slate-900">See all devices logged into your account</h2>
              </div>
            </div>
            <div className="space-y-4">
              {loadingDevices ? (
                <p className="text-slate-500">Loading devices...</p>
              ) : deviceSessions.length === 0 ? (
                <p className="text-slate-500">No active devices found.</p>
              ) : (
                deviceSessions.map((session) => (
                  <div key={session.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 text-lg">
                        {session.device_name.toLowerCase().includes('phone') || session.device_name.toLowerCase().includes('tablet') ? '📱' : '💻'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{session.browser}</p>
                        <p className="text-sm text-slate-500">{hideIp(session.ip_address)}</p>
                        <p className="text-sm text-slate-500">Last active {formatDateTime(session.last_active)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {session.is_current && <span className="rounded-full bg-teal-600 px-3 py-1 text-white text-xs font-semibold">Current Device</span>}
                        {!session.is_current && (
                          <button onClick={() => handleTerminateDevice(session.id)} className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600">
                            Terminate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-teal-700 font-semibold">💣 Mine Field</p>
                <h2 className="text-xl font-bold text-slate-900">Show an alert when someone logs in</h2>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600">Show a custom alert message when someone logs into your account.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleMinefield(!minefieldEnabled)} className={`rounded-full px-4 py-2 text-sm font-semibold ${minefieldEnabled ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {minefieldEnabled ? 'ON' : 'OFF'}
                </button>
                <span className="text-sm text-slate-500">Mine Field is currently <strong>{minefieldEnabled ? 'enabled' : 'disabled'}</strong>.</span>
              </div>
              {minefieldEnabled && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Alert message</label>
                  <textarea value={minefieldMessage} onChange={(e) => setMinefieldMessage(e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-700 outline-none resize-none" placeholder="Hey! Someone just logged into your account!" />
                  <button onClick={handleSaveMinefieldMessage} disabled={savingSettings} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70">
                    {savingSettings ? 'Saving...' : 'Save Message'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-teal-700 font-semibold">🛡️ Firewall</p>
                <h2 className="text-xl font-bold text-slate-900">Block suspicious links and ads</h2>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600">Block suspicious URLs from appearing in your browsing and product descriptions on NestKH.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleFirewall(!firewallEnabled)} className={`rounded-full px-4 py-2 text-sm font-semibold ${firewallEnabled ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {firewallEnabled ? 'ON' : 'OFF'}
                </button>
                <span className="text-sm text-slate-500">Firewall is <strong>{firewallEnabled ? 'enabled' : 'disabled'}</strong>.</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Block non-nestkh.com suspicious URLs</li>
                <li>Block shorteners like bit.ly or tinyurl.com</li>
                <li>Block script tags in content</li>
              </ul>
            </div>
          </section>

          <section className="lg:col-span-2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-teal-700 font-semibold">📊 Activity Log</p>
                <h2 className="text-xl font-bold text-slate-900">See your account activity history</h2>
              </div>
              <button onClick={handleClearLogs} disabled={clearLogsLoading} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70">
                {clearLogsLoading ? 'Clearing...' : 'Clear All Logs'}
              </button>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {loadingLogs ? (
                <p className="text-slate-500">Loading logs...</p>
              ) : activityLogs.length === 0 ? (
                <p className="text-slate-500">No activity yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                          {log.action.toLowerCase().includes('logout') ? '🔴' : log.action.toLowerCase().includes('pin') ? '🟡' : '🟢'}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{log.action}</p>
                          <p className="text-sm text-slate-500">{log.device || 'Unknown device'}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{formatDateTime(log.created_at)}</p>
                        <p>{hideIp(log.ip_address)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
