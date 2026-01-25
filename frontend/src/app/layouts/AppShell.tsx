import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useMemo, useState } from "react"
import {
  BarChart3,
  Home,
  List,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Target,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSignOut } from "@/features/auth/hooks/useSignOut"
import { NewExpenseSheet } from "@/features/expenses/components/NewExpenseSheet"
import { Button } from "@/components/ui/button"

type NavItem = {
  to: string
  label: string
  Icon: typeof Home
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Inicio", Icon: Home, end: true },
  { to: "/movimientos", label: "Movimientos", Icon: List },
  { to: "/objetivos", label: "Objetivos", Icon: Target },
  { to: "/metricas", label: "Métricas", Icon: BarChart3 },
  { to: "/asesor", label: "Asesor IA", Icon: Sparkles },
]

const TITLE_BY_PATH = {
  "/": "Inicio",
  "/movimientos": "Movimientos",
  "/objetivos": "Objetivos",
  "/metricas": "Métricas",
  "/asesor": "Asesor IA",
  "/settings": "Configuración",
} as const

const FAB_PATH_PREFIXES = [
  "/",
  "/movimientos",
  "/objetivos",
  "/metricas",
  "/asesor",
] as const

export const AppShell = () => {
  const { pathname } = useLocation()
  const { isLoading, signOut } = useSignOut()
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false)

  const title = TITLE_BY_PATH[pathname as keyof typeof TITLE_BY_PATH] ?? "FinCore"
  const showFab = useMemo(() => {
    return FAB_PATH_PREFIXES.some((prefix) =>
      prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)
    )
  }, [pathname])

  const handleSignOut = (): void => {
    void signOut()
  }

  const handleFabClick = (): void => {
    setIsNewExpenseOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur shadow-sm">
        <div className="grid w-full grid-cols-3 items-center px-3 py-2 sm:px-4 sm:py-3">
          <Button
            asChild
            className="h-8 w-8 justify-self-start sm:h-9 sm:w-9"
            size="icon"
            variant="ghost"
            aria-label="Configuración"
            title="Configuración"
          >
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configuración</span>
            </Link>
          </Button>
          <h1 className="justify-self-center text-center text-sm font-semibold sm:text-base">
            {title}
          </h1>
          <Button
            aria-label={isLoading ? "Cerrando sesión" : "Cerrar sesión"}
            title={isLoading ? "Cerrando sesión" : "Cerrar sesión"}
            disabled={isLoading}
            onClick={handleSignOut}
            className="h-8 w-8 justify-self-end sm:h-9 sm:w-9"
            size="icon"
            type="button"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="pb-20 pt-4">
        <Outlet />
      </main>

      {showFab ? (
        <Button
          aria-label="Nuevo gasto"
          className="fixed bottom-20 right-4 z-30 h-12 w-12 rounded-full shadow-lg"
          onClick={handleFabClick}
          variant="default"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Nuevo gasto</span>
        </Button>
      ) : null}

      <NewExpenseSheet
        open={isNewExpenseOpen}
        onOpenChange={setIsNewExpenseOpen}
      />

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-5 gap-1 px-2 py-1.5">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-[11px]",
                  isActive && "bg-muted text-foreground ring-1 ring-border"
                )
              }
              end={end}
              to={to}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
