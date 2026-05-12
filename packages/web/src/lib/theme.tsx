import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeName =
  | 'light'
  | 'dark'
  | 'blue'
  | 'cappuccino'
  | 'forest'
  | 'rose'
  | 'black'
  | 'orange'
  | 'mocha'
  | 'lavender'
  | 'midnight'

export interface ThemeMeta {
  id: ThemeName
  label: string
  isDark: boolean
  swatch: { bg: string; primary: string }
}

export const THEMES: ThemeMeta[] = [
  { id: 'light', label: 'Clair', isDark: false, swatch: { bg: 'oklch(1 0 0)', primary: 'oklch(0.55 0.22 265)' } },
  { id: 'dark', label: 'Sombre', isDark: true, swatch: { bg: 'oklch(0.142 0.024 262)', primary: 'oklch(0.62 0.22 265)' } },
  { id: 'black', label: 'Noir', isDark: true, swatch: { bg: 'oklch(0 0 0)', primary: 'oklch(0.97 0 0)' } },
  { id: 'midnight', label: 'Minuit', isDark: true, swatch: { bg: 'oklch(0.12 0.04 290)', primary: 'oklch(0.7 0.2 295)' } },
  { id: 'mocha', label: 'Mocha', isDark: true, swatch: { bg: 'oklch(0.21 0.025 295)', primary: 'oklch(0.78 0.13 30)' } },
  { id: 'forest', label: 'Forêt', isDark: true, swatch: { bg: 'oklch(0.17 0.025 165)', primary: 'oklch(0.65 0.14 155)' } },
  { id: 'blue', label: 'Bleu', isDark: true, swatch: { bg: 'oklch(0.16 0.05 245)', primary: 'oklch(0.68 0.16 235)' } },
  { id: 'cappuccino', label: 'Cappuccino', isDark: false, swatch: { bg: 'oklch(0.965 0.022 80)', primary: 'oklch(0.42 0.09 50)' } },
  { id: 'orange', label: 'Orange', isDark: false, swatch: { bg: 'oklch(0.985 0.012 70)', primary: 'oklch(0.7 0.2 50)' } },
  { id: 'lavender', label: 'Lavande', isDark: false, swatch: { bg: 'oklch(0.975 0.018 295)', primary: 'oklch(0.55 0.2 295)' } },
  { id: 'rose', label: 'Rose', isDark: false, swatch: { bg: 'oklch(0.98 0.01 20)', primary: 'oklch(0.6 0.16 10)' } },
]

interface ThemeContextValue {
  theme: ThemeName
  meta: ThemeMeta
  setTheme: (theme: ThemeName) => void
  themes: ThemeMeta[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'bigdil-theme'
const DEFAULT_THEME: ThemeName = 'light'

function isThemeName(value: string | null): value is ThemeName {
  return THEMES.some((t) => t.id === value)
}

function getStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isThemeName(stored)) return stored
    // Back-compat: previous values were 'light' | 'dark' | 'system'
    if (stored === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME
}

function applyThemeToRoot(theme: ThemeName) {
  const root = document.documentElement
  const meta = THEMES.find((t) => t.id === theme) ?? THEMES[0]
  root.dataset.theme = meta.id
  if (meta.isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getStoredTheme)

  useEffect(() => {
    applyThemeToRoot(theme)
  }, [theme])

  function setTheme(next: ThemeName) {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  const meta = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <ThemeContext.Provider value={{ theme, meta, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
