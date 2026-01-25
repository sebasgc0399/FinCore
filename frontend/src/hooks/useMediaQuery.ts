import { useEffect, useState } from "react"

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches)
    }

    setMatches(mediaQueryList.matches)

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
  }, [query])

  return matches
}
