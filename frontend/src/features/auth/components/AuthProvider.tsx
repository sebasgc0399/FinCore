import { createContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"

import { i18n } from "@/lib/i18n"
import { auth } from "@/lib/firebase"
import { bootstrapUser } from "@/features/auth/services/userBootstrap"
import { listenUserPreferences } from "@/features/settings/services/userPreferences"
import { useTheme } from "@/hooks/useTheme"

type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  setError: (message: string | null) => void
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message
  }

  return "No pudimos preparar tu cuenta. Intenta de nuevo."
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setThemeMode, setTheme } = useTheme()

  useEffect(() => {
    let isMounted = true
    let hasResolvedAuth = false

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (!isMounted) {
          return
        }

        setUser(nextUser)
        if (!hasResolvedAuth) {
          setLoading(false)
          hasResolvedAuth = true
        }
        if (nextUser) {
          setError(null)
        }
      },
      (authError) => {
        if (!isMounted) {
          return
        }

        setUser(null)
        if (!hasResolvedAuth) {
          setLoading(false)
          hasResolvedAuth = true
        }
        setError(authError.message)
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    let isMounted = true
    let unsubscribe: (() => void) | null = null

    const runBootstrap = async () => {
      try {
        await bootstrapUser(user)

        if (!isMounted) {
          return
        }

        unsubscribe = listenUserPreferences(
          user.uid,
          (preferences) => {
            if (!isMounted) {
              return
            }

            if (i18n.language !== preferences.language) {
              void i18n.changeLanguage(preferences.language)
            }

            if (preferences.themeMode === "system") {
              setThemeMode("system")
              return
            }

            setTheme(preferences.theme)
            setThemeMode("manual")
          },
          (preferencesError) => {
            if (!isMounted) {
              return
            }
            setError(getErrorMessage(preferencesError))
          }
        )
      } catch (bootstrapError: unknown) {
        if (!isMounted) {
          return
        }
        setError(getErrorMessage(bootstrapError))
      }
    }

    void runBootstrap()

    return () => {
      isMounted = false
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user, setError, setThemeMode, setTheme])

  return (
    <AuthContext.Provider value={{ user, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
