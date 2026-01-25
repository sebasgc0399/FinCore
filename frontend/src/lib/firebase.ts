import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

type FirebaseEnvKey =
  | "VITE_FIREBASE_API_KEY"
  | "VITE_FIREBASE_AUTH_DOMAIN"
  | "VITE_FIREBASE_PROJECT_ID"
  | "VITE_FIREBASE_STORAGE_BUCKET"
  | "VITE_FIREBASE_MESSAGING_SENDER_ID"
  | "VITE_FIREBASE_APP_ID"

const getRequiredEnv = (key: FirebaseEnvKey): string => {
  const value = import.meta.env[key]

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

const isLocalHostname = (hostname: string): boolean => {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true
  }

  if (hostname.endsWith(".local")) {
    return true
  }

  const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/
  return ipv4Pattern.test(hostname)
}

const resolveAuthDomain = (): string => {
  const fallbackDomain = getRequiredEnv("VITE_FIREBASE_AUTH_DOMAIN")

  if (typeof window === "undefined") {
    return fallbackDomain
  }

  const hostname = window.location.hostname

  if (isLocalHostname(hostname)) {
    return fallbackDomain
  }

  // iOS Safari puede romper auth si authDomain != hostname.
  return hostname
}

const measurementId =
  typeof import.meta.env.VITE_FIREBASE_MEASUREMENT_ID === "string"
    ? import.meta.env.VITE_FIREBASE_MEASUREMENT_ID.trim()
    : ""

const firebaseConfig = {
  apiKey: getRequiredEnv("VITE_FIREBASE_API_KEY"),
  authDomain: resolveAuthDomain(),
  projectId: getRequiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnv("VITE_FIREBASE_APP_ID"),
  ...(measurementId ? { measurementId } : {}),
} satisfies FirebaseOptions

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export { app }
