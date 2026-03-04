'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      style={{
        display: 'flex',
        width: '64px',
        height: '32px',
        padding: '4px',
        borderRadius: '9999px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isDark ? '#09090b' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}
    >
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        transform: isDark ? 'translateX(0)' : 'translateX(32px)',
        background: isDark ? '#27272a' : '#e5e7eb',
        position: 'absolute'
      }}>
        {isDark ? <Moon size={14} color="white" strokeWidth={1.5} /> : <Sun size={14} color="#374151" strokeWidth={1.5} />}
      </div>
      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isDark ? <Sun size={14} color="#71717a" strokeWidth={1.5} /> : <Moon size={14} color="#111827" strokeWidth={1.5} />}
      </div>
      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isDark ? <Sun size={14} color="#71717a" strokeWidth={1.5} /> : <Moon size={14} color="#111827" strokeWidth={1.5} />}
      </div>
    </div>
  )
}
