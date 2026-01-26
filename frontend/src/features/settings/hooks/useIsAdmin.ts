import { useEffect, useState } from "react"

import { useAuth } from "@/features/auth/hooks/useAuth"

type UseIsAdminResult = {
  isAdmin: boolean
  loading: boolean
}

type AdminClaimState = {
  uid: string | null
  isAdmin: boolean
}

const isAdminClaim = (claims: unknown): boolean => {
  if (typeof claims !== "object" || claims === null) {
    return false
  }

  return "admin" in claims && (claims as { admin?: unknown }).admin === true
}

export const useIsAdmin = (): UseIsAdminResult => {
  const { user } = useAuth()
  const [claimState, setClaimState] = useState<AdminClaimState>({
    uid: null,
    isAdmin: false,
  })

  useEffect(() => {
    let isMounted = true

    if (!user) {
      return () => {
        isMounted = false
      }
    }

    const resolveClaims = async () => {
      try {
        const tokenResult = await user.getIdTokenResult()
        if (!isMounted) {
          return
        }

        setClaimState({
          uid: user.uid,
          isAdmin: isAdminClaim(tokenResult.claims),
        })
      } catch {
        if (!isMounted) {
          return
        }

        setClaimState({ uid: user.uid, isAdmin: false })
      }
    }

    void resolveClaims()

    return () => {
      isMounted = false
    }
  }, [user])

  if (!user) {
    return { isAdmin: false, loading: false }
  }

  const isAdmin = claimState.uid === user.uid && claimState.isAdmin
  const loading = claimState.uid !== user.uid

  return { isAdmin, loading }
}
