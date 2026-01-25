import { useState } from "react"

import { signInWithGoogle } from "@/features/auth/services/authService"

type UseGoogleSignInResult = {
  isLoading: boolean
  errorMessage: string | null
  signIn: () => Promise<void>
}

export const useGoogleSignIn = (): UseGoogleSignInResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const signIn = async (): Promise<void> => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos iniciar sesion con Google. Intenta de nuevo."

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, errorMessage, signIn }
}
