import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"

import { auth } from "@/lib/firebase"

const googleProvider = new GoogleAuthProvider()

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message
  }

  return fallback
}

const getErrorCode = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null
  }

  const { code } = error as { code?: unknown }
  return typeof code === "string" ? code : null
}

export const signInWithGoogle = async (): Promise<void> => {
  const fallbackMessage = "No pudimos iniciar sesion con Google. Intenta de nuevo."
  const popupErrorMessage = "Activa ventanas emergentes e intenta de nuevo"

  try {
    await signInWithPopup(auth, googleProvider)
  } catch (error: unknown) {
    const errorCode = getErrorCode(error)

    if (
      errorCode === "auth/popup-blocked" ||
      errorCode === "auth/popup-closed-by-user"
    ) {
      throw new Error(popupErrorMessage)
    }

    throw new Error(getErrorMessage(error, fallbackMessage))
  }
}

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("No pudimos cerrar sesion. Intenta de nuevo.")
  }
}
