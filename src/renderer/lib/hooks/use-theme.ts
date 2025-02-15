import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth-store'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const { settings, updateSettings } = useAuthStore()

  const setTheme = (theme: Theme) => {
    const root = window.document.documentElement

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemTheme)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }

    updateSettings({ theme })
  }

  // Sync theme with system changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (settings.theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.theme])

  return {
    theme: settings.theme,
    setTheme,
    isDarkMode:
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches),
    isSystemTheme: settings.theme === 'system',
  }
}
