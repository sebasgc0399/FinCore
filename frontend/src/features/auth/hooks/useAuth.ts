import { useContext } from "react"
import type { User } from "firebase/auth"

import { AuthContext } from "@/features/auth/components/AuthProvider"

type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  setError: (message: string | null) => void
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
