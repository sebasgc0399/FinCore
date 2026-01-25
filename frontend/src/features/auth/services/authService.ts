import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth"

import { auth } from "@/lib/firebase"

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error("No pudimos iniciar sesion con Google. Intenta de nuevo.")
  }
}
