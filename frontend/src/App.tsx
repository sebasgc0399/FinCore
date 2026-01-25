import { AppRouter } from "@/app/AppRouter"
import { ThemeProvider } from "@/app/ThemeProvider"
import { AuthProvider } from "@/features/auth/components/AuthProvider"

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}
