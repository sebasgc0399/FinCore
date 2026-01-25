import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "@/features/auth/hooks/useAuth"

type PublicRouteProps = {
  children: ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground" role="status">
          Cargando...
        </p>
      </main>
    )
  }

  if (user) {
    return <Navigate replace to="/" />
  }

  return <>{children}</>
}
