import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const LoginPage = (): JSX.Element => {
  const handleGoogleSignIn = (): void => {
    // TODO: Integrate Google Sign-In with Firebase
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
              <CardDescription>Inicia sesión para continuar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gestiona tu dinero con claridad y control desde cualquier lugar.
          </p>
          <Button className="w-full" onClick={handleGoogleSignIn} type="button">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground/70"
            >
              G
            </span>
            Continuar con Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center gap-4 text-xs text-muted-foreground">
          <a className="underline-offset-4 hover:underline" href="#">
            Términos
          </a>
          <a className="underline-offset-4 hover:underline" href="#">
            Privacidad
          </a>
        </CardFooter>
      </Card>
    </main>
  )
}
