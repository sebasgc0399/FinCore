import { Link } from "react-router-dom"

import { isIOSSafari } from "@/lib/isIOSSafari"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useGoogleSignIn } from "@/features/auth/hooks/useGoogleSignIn"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const LoginPage = () => {
  const { error, setError } = useAuth()
  const { errorMessage, isLoading, signIn } = useGoogleSignIn()
  const primaryError = errorMessage ?? error ?? null
  const hasLoginError = Boolean(primaryError)
  const showIOSSafariHint = isIOSSafari() && hasLoginError

  const handleGoogleSignIn = (): void => {
    if (error) {
      setError(null)
    }

    void signIn()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              FC
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">FinCore</CardTitle>
              <CardDescription>
                Accede con tu cuenta de Google para continuar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Controla gastos, presupuestos y metas con claridad, estés donde
            estés.
          </p>
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            type="button"
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground/70"
            >
              G
            </span>
            {isLoading ? "Conectando..." : "Continuar con Google"}
          </Button>
          {primaryError ? (
            <p className="text-sm text-destructive" role="alert">
              {primaryError}
            </p>
          ) : null}
          {showIOSSafariHint ? (
            <p className="text-sm text-muted-foreground">
              En Safari iOS, los popups pueden bloquearse. Desactiva modo
              privado o habilita ventanas emergentes.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-center gap-4 text-xs text-muted-foreground">
          <Link className="underline-offset-4 hover:underline" to="/terms">
            Términos
          </Link>
          <Link className="underline-offset-4 hover:underline" to="/privacy">
            Privacidad
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
