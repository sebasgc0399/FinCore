import { BrowserRouter, Route, Routes } from "react-router-dom"

import { AppShell } from "@/app/layouts/AppShell"
import { AdvisorPage } from "@/app/pages/AdvisorPage"
import { HomePage } from "@/app/pages/HomePage"
import { MetricsPage } from "@/app/pages/MetricsPage"
import { MovementsPage } from "@/app/pages/MovementsPage"
import { NotFoundPage } from "@/app/pages/NotFoundPage"
import { ObjectivesPage } from "@/app/pages/ObjectivesPage"
import { PrivacyPage } from "@/app/pages/PrivacyPage"
import { SettingsPage } from "@/app/pages/SettingsPage"
import { TermsPage } from "@/app/pages/TermsPage"
import { PublicRoute } from "@/features/auth/components/PublicRoute"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { LoginPage } from "@/features/auth/components/LoginPage"

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route element={<HomePage />} index />
          <Route element={<MovementsPage />} path="movimientos" />
          <Route element={<ObjectivesPage />} path="objetivos" />
          <Route element={<MetricsPage />} path="metricas" />
          <Route element={<AdvisorPage />} path="asesor" />
          <Route element={<SettingsPage />} path="settings" />
        </Route>
        <Route
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
          path="/login"
        />
        <Route element={<TermsPage />} path="/terms" />
        <Route element={<PrivacyPage />} path="/privacy" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}
