import { useAuth } from "@/features/auth/hooks/useAuth"
import { useSignOut } from "@/features/auth/hooks/useSignOut"

import { Button } from "@/components/ui/button"

export const DashboardPage = (): JSX.Element => {
  const { user } = useAuth()
  const { errorMessage, isLoading, signOut } = useSignOut()

  const handleSignOut = (): void => {
    void signOut()
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {user?.displayName
            ? `Hola, ${user.displayName}.`
            : "Sesion iniciada correctamente."}
        </p>
        <Button disabled={isLoading} onClick={handleSignOut} type="button">
          {isLoading ? "Cerrando sesion..." : "Cerrar sesion"}
        </Button>
        {errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </main>
  )
}
