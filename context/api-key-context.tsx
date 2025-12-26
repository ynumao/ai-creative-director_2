"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface ApiKeyContextType {
  apiKey: string | null
  setApiKey: (key: string) => void
  hasKey: boolean
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null)

  useEffect(() => {
    // Try to load from sessionStorage to persist across reloads but not permanent storage
    const storedKey = sessionStorage.getItem("gemini_api_key")
    if (storedKey) {
      setApiKeyState(storedKey)
    }
  }, [])

  const setApiKey = (key: string) => {
    if (key) {
        sessionStorage.setItem("gemini_api_key", key)
    } else {
        sessionStorage.removeItem("gemini_api_key")
    }
    setApiKeyState(key)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, hasKey: !!apiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider")
  }
  return context
}
