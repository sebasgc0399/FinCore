import { useSyncExternalStore } from "react"

export const useMediaQuery = (query: string): boolean => {
  const getSnapshot = (): boolean => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia(query).matches
  }

  const getServerSnapshot = (): boolean => false

  const subscribe = (onStoreChange: () => void): (() => void) => {
    if (typeof window === "undefined") {
      return () => {}
    }

    const mediaQueryList = window.matchMedia(query)
    const handleChange = (): void => {
      onStoreChange()
    }

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange)
      return () => {
        mediaQueryList.removeEventListener("change", handleChange)
      }
    }

    mediaQueryList.addListener(handleChange)
    return () => {
      mediaQueryList.removeListener(handleChange)
    }
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
