import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { UserDoc } from "@/types/db-schema"

type LanguageCode = UserDoc["preferences"]["language"]
type ThemeMode = UserDoc["preferences"]["themeMode"]
type ThemeValue = UserDoc["preferences"]["theme"]

export type UserPreferences = {
  language: LanguageCode
  themeMode: ThemeMode
  theme: ThemeValue
}

export type UserPreferencesUpdate = Partial<UserPreferences>

const DEFAULT_PREFERENCES: UserPreferences = {
  language: "es",
  themeMode: "system",
  theme: "light",
}

const isLanguage = (value: unknown): value is LanguageCode =>
  value === "es" || value === "en"

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "system" || value === "manual"

const isTheme = (value: unknown): value is ThemeValue =>
  value === "light" || value === "dark"

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error
  }

  return new Error("No pudimos cargar tus preferencias.")
}

const parsePreferences = (data: unknown): UserPreferences => {
  if (typeof data !== "object" || data === null) {
    return DEFAULT_PREFERENCES
  }

  const record = data as Record<string, unknown>
  const preferences =
    typeof record.preferences === "object" && record.preferences !== null
      ? (record.preferences as Record<string, unknown>)
      : {}

  return {
    language: isLanguage(preferences.language)
      ? preferences.language
      : DEFAULT_PREFERENCES.language,
    themeMode: isThemeMode(preferences.themeMode)
      ? preferences.themeMode
      : DEFAULT_PREFERENCES.themeMode,
    theme: isTheme(preferences.theme) ? preferences.theme : DEFAULT_PREFERENCES.theme,
  }
}

export const listenUserPreferences = (
  uid: string,
  onChange: (preferences: UserPreferences) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const userRef = doc(db, "users", uid)

  return onSnapshot(
    userRef,
    (snapshot) => {
      onChange(parsePreferences(snapshot.data()))
    },
    (error) => {
      if (onError) {
        onError(toError(error))
      }
    }
  )
}

export const updateUserPreferences = async (
  uid: string,
  updates: UserPreferencesUpdate
): Promise<void> => {
  const updatePayload: Record<string, unknown> = {
    "metadata.updatedAt": serverTimestamp(),
  }

  if (updates.language) {
    updatePayload["preferences.language"] = updates.language
  }

  if (updates.themeMode) {
    updatePayload["preferences.themeMode"] = updates.themeMode
  }

  if (updates.theme) {
    updatePayload["preferences.theme"] = updates.theme
  }

  if (Object.keys(updatePayload).length === 1) {
    return
  }

  await updateDoc(doc(db, "users", uid), updatePayload)
}
