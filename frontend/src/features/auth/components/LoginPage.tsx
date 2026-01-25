import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("auth")
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
              <CardDescription>{t("login.description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("login.tagline")}</p>
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
            {isLoading ? t("login.connecting") : t("login.continueGoogle")}
          </Button>
          {primaryError ? (
            <p className="text-sm text-destructive" role="alert">
              {primaryError}
            </p>
          ) : null}
          {showIOSSafariHint ? (
            <p className="text-sm text-muted-foreground">
              {t("login.iosHint")}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-center gap-4 text-xs text-muted-foreground">
          <Link className="underline-offset-4 hover:underline" to="/terms">
            {t("login.terms")}
          </Link>
          <Link className="underline-offset-4 hover:underline" to="/privacy">
            {t("login.privacy")}
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
