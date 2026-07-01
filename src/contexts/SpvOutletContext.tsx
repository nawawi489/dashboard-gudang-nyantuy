import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'spv_selected_outlet'

interface SpvOutletContextType {
  outlet: string
  setOutlet: (outlet: string) => void
  clearOutlet: () => void
  isOutletSelected: boolean
}

const SpvOutletContext = createContext<SpvOutletContextType | null>(null)

export function SpvOutletProvider({ children }: { children: ReactNode }) {
  const [outlet, setOutletState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      if (outlet) {
        localStorage.setItem(STORAGE_KEY, outlet)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [outlet])

  const setOutlet = (value: string) => setOutletState(value)
  const clearOutlet = () => setOutletState('')

  return (
    <SpvOutletContext.Provider
      value={{ outlet, setOutlet, clearOutlet, isOutletSelected: !!outlet }}
    >
      {children}
    </SpvOutletContext.Provider>
  )
}

export function useSpvOutlet() {
  const ctx = useContext(SpvOutletContext)
  if (!ctx) throw new Error('useSpvOutlet must be used within SpvOutletProvider')
  return ctx
}
