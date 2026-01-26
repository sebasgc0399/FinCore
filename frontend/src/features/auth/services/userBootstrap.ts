import type { User } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type WithFieldValue,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { UserDoc } from "@/types/db-schema"

type ThemePreference = UserDoc["preferences"]["themeMode"]
type ThemeValue = UserDoc["preferences"]["theme"]
type LanguageCode = UserDoc["preferences"]["language"]

const SUPPORTED_LANGUAGES = ["es", "en"] as const

const normalizeLanguage = (
  value: string | null | undefined
): LanguageCode | null => {
  if (!value) {
    return null
  }

  const lower = value.toLowerCase()
  if (SUPPORTED_LANGUAGES.includes(lower as LanguageCode)) {
    return lower as LanguageCode
  }

  if (lower.startsWith("es")) {
    return "es"
  }

  if (lower.startsWith("en")) {
    return "en"
  }

  return null
}

const getUserEmail = (user: User): string => {
  const directEmail = user.email?.trim()
  if (directEmail) {
    return directEmail
  }

  const providerEmail = user.providerData
    .map((provider) => provider.email?.trim())
    .find((email) => Boolean(email))

  if (providerEmail) {
    return providerEmail
  }

  throw new Error("No pudimos obtener el correo del usuario.")
}

const getDisplayName = (user: User, email: string): string => {
  const displayName = user.displayName?.trim()
  if (displayName) {
    return displayName
  }

  if (email.trim()) {
    return email
  }

  return "Usuario"
}

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error
  }

  return new Error("Ocurrio un error inesperado durante el bootstrap.")
}

export const getInitialLanguage = (): LanguageCode => {
  const browserLanguage =
    typeof navigator !== "undefined" ? normalizeLanguage(navigator.language) : null

  return browserLanguage ?? "es"
}

export const getInitialThemeMode = (): ThemePreference => {
  return "system"
}

export const getInitialTheme = (): ThemeValue => {
  if (typeof window === "undefined") {
    return "light"
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

export const ensureUserDocument = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid)
    const userSnapshot = await getDoc(userRef)

    if (userSnapshot.exists()) {
      await updateDoc(userRef, {
        "metadata.lastLoginAt": serverTimestamp(),
        "metadata.updatedAt": serverTimestamp(),
      })
      return
    }

    const email = getUserEmail(user)
    const displayName = getDisplayName(user, email)
    const photoURL = user.photoURL?.trim()
    const language = getInitialLanguage()
    const themeMode = getInitialThemeMode()
    const theme = getInitialTheme()

    const newUserDoc: WithFieldValue<UserDoc> = {
      uid: user.uid,
      profile: {
        displayName,
        email,
        ...(photoURL ? { photoURL } : {}),
      },
      preferences: {
        currency: "COP",
        language,
        advisorMode: "amable",
        themeMode,
        theme,
      },
      auth: {
        role: "free",
        openaiKeyStored: false,
        subscription: {
          status: "expired",
          source: "manual",
          expiresAt: null,
          updatedAt: serverTimestamp(),
        },
      },
      metadata: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
    }

    await setDoc(userRef, newUserDoc)
  } catch (error: unknown) {
    throw toError(error)
  }
}

export const seedDefaultCustomCategories = async (uid: string): Promise<void> => {
  try {
    const categoriesRef = collection(db, "users", uid, "custom_categories")
    const existingSnapshot = await getDocs(query(categoriesRef, limit(1)))

    if (!existingSnapshot.empty) {
      return
    }

    const batch = writeBatch(db)
    const expenseRef = doc(categoriesRef, "otros")
    const incomeRef = doc(categoriesRef, "ingreso")

    batch.set(expenseRef, {
      kind: "expense",
      label: "Otros",
      icon: "Tag",
      order: 0,
      isArchived: false,
    })
    batch.set(incomeRef, {
      kind: "income",
      label: "Ingreso",
      icon: "Wallet",
      order: 1,
      isArchived: false,
    })

    await batch.commit()
  } catch (error: unknown) {
    throw toError(error)
  }
}

export const bootstrapUser = async (user: User): Promise<void> => {
  try {
    await ensureUserDocument(user)
    await seedDefaultCustomCategories(user.uid)
  } catch (error: unknown) {
    throw toError(error)
  }
}
