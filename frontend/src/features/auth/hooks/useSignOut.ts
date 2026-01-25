import { useState } from "react"

import { signOutUser } from "@/features/auth/services/authService"

type UseSignOutResult = {
  isLoading: boolean
  errorMessage: string | null
  signOut: () => Promise<void>
}

export const useSignOut = (): UseSignOutResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const signOut = async (): Promise<void> => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await signOutUser()
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos cerrar sesion. Intenta de nuevo."

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, errorMessage, signOut }
}
