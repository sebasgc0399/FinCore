import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
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
  labelKey: string
  Icon: typeof Home
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "home", Icon: Home, end: true },
  { to: "/movimientos", labelKey: "movements", Icon: List },
  { to: "/objetivos", labelKey: "objectives", Icon: Target },
  { to: "/metricas", labelKey: "metrics", Icon: BarChart3 },
  { to: "/asesor", labelKey: "advisor", Icon: Sparkles },
]

const TITLE_BY_PATH = {
  "/": "nav:home",
  "/movimientos": "nav:movements",
  "/objetivos": "nav:objectives",
  "/metricas": "nav:metrics",
  "/asesor": "nav:advisor",
  "/settings": "settings:titles.home",
  "/settings/account": "settings:titles.account",
  "/settings/subscription": "settings:titles.subscription",
  "/settings/support": "settings:titles.support",
  "/settings/legal": "settings:titles.legal",
  "/settings/admin": "settings:titles.admin",
} as const

const FAB_PATH_PREFIXES = [
  "/",
  "/movimientos",
  "/objetivos",
  "/metricas",
  "/asesor",
] as const

export const AppShell = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { isLoading, signOut } = useSignOut()
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false)

  const normalizedPath =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
  const titleKey = TITLE_BY_PATH[normalizedPath as keyof typeof TITLE_BY_PATH]
  const title = titleKey ? t(titleKey) : t("common:appName")
  const settingsLabel = t("settings:titles.home")
  const signOutLabel = t("common:actions.signOut")
  const newExpenseLabel = t("common:actions.newExpense")
  const showFab = useMemo(() => {
    return FAB_PATH_PREFIXES.some((prefix) =>
      prefix === "/"
        ? normalizedPath === "/"
        : normalizedPath.startsWith(prefix)
    )
  }, [normalizedPath])

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
            aria-label={settingsLabel}
            title={settingsLabel}
          >
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">{settingsLabel}</span>
            </Link>
          </Button>
          <h1 className="justify-self-center text-center text-sm font-semibold sm:text-base">
            {title}
          </h1>
          <Button
            aria-label={signOutLabel}
            title={signOutLabel}
            disabled={isLoading}
            onClick={handleSignOut}
            className="h-8 w-8 justify-self-end sm:h-9 sm:w-9"
            size="icon"
            type="button"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">{signOutLabel}</span>
          </Button>
        </div>
      </header>

      <main className="pb-20 pt-4">
        <Outlet />
      </main>

      {showFab ? (
        <Button
          aria-label={newExpenseLabel}
          className="fixed bottom-20 right-4 z-30 h-12 w-12 rounded-full shadow-lg"
          onClick={handleFabClick}
          variant="default"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">{newExpenseLabel}</span>
        </Button>
      ) : null}

      <NewExpenseSheet
        open={isNewExpenseOpen}
        onOpenChange={setIsNewExpenseOpen}
      />

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-5 gap-1 px-2 py-1.5">
          {NAV_ITEMS.map(({ to, labelKey, Icon, end }) => {
            const label = t(`nav:${labelKey}`)

            return (
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
            )
          })}
        </div>
      </nav>
    </div>
  )
}
