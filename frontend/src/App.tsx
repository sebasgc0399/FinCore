import { AppRouter } from "@/app/AppRouter"
import { AuthProvider } from "@/features/auth/components/AuthProvider"

export const App = (): JSX.Element => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
