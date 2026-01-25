import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { useAuth } from "@/features/auth/hooks/useAuth"

type UseIsAdminResult = {
  isAdmin: boolean
  loading: boolean
}

type UserDocData = {
  auth?: {
    role?: unknown
  }
}

type AdminSnapshotState = {
  uid: string | null
  isAdmin: boolean
}

const getRole = (data: unknown): unknown => {
  if (typeof data !== "object" || data === null) {
    return undefined
  }

  const record = data as UserDocData
  return record.auth?.role
}

export const useIsAdmin = (): UseIsAdminResult => {
  const { user } = useAuth()
  const [snapshotState, setSnapshotState] = useState<AdminSnapshotState>({
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

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        if (!isMounted) {
          return
        }

        const role = getRole(snapshot.data())
        setSnapshotState({ uid: user.uid, isAdmin: role === "admin" })
      },
      () => {
        if (!isMounted) {
          return
        }

        setSnapshotState({ uid: user.uid, isAdmin: false })
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [user])

  if (!user) {
    return { isAdmin: false, loading: false }
  }

  const isAdmin = snapshotState.uid === user.uid && snapshotState.isAdmin
  const loading = snapshotState.uid !== user.uid

  return { isAdmin, loading }
}
