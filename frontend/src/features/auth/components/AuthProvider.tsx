import { createContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"

import { auth } from "@/lib/firebase"
import { bootstrapUser } from "@/features/auth/services/userBootstrap"

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

    const runBootstrap = async () => {
      try {
        await bootstrapUser(user)
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
    }
  }, [user, setError])

  return (
    <AuthContext.Provider value={{ user, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
