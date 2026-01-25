import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/app/layouts/AppShell"
import { AdvisorPage } from "@/app/pages/AdvisorPage"
import { HomePage } from "@/app/pages/HomePage"
import { MetricsPage } from "@/app/pages/MetricsPage"
import { MovementsPage } from "@/app/pages/MovementsPage"
import { NotFoundPage } from "@/app/pages/NotFoundPage"
import { ObjectivesPage } from "@/app/pages/ObjectivesPage"
import { PrivacyPage } from "@/app/pages/PrivacyPage"
import { TermsPage } from "@/app/pages/TermsPage"
import { LoginPage } from "@/features/auth/components/LoginPage"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { PublicRoute } from "@/features/auth/components/PublicRoute"
import { SettingsAccountPage } from "@/features/settings/SettingsAccountPage"
import { SettingsAdminPage } from "@/features/settings/SettingsAdminPage"
import { SettingsHomePage } from "@/features/settings/SettingsHomePage"
import { SettingsLayout } from "@/features/settings/SettingsLayout"
import { SettingsLegalPage } from "@/features/settings/SettingsLegalPage"
import { SettingsSubscriptionPage } from "@/features/settings/SettingsSubscriptionPage"
import { SettingsSupportPage } from "@/features/settings/SettingsSupportPage"
import { useIsAdmin } from "@/features/settings/hooks/useIsAdmin"

export const AppRouter = () => {
  const { isAdmin, loading } = useIsAdmin()

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
          <Route element={<SettingsLayout />} path="settings">
            <Route element={<SettingsHomePage />} index />
            <Route element={<SettingsAccountPage />} path="account" />
            <Route element={<SettingsSubscriptionPage />} path="subscription" />
            <Route element={<SettingsSupportPage />} path="support" />
            <Route element={<SettingsLegalPage />} path="legal" />
            <Route
              element={
                loading ? null : isAdmin ? (
                  <SettingsAdminPage />
                ) : (
                  <Navigate replace to="/settings" />
                )
              }
              path="admin"
            />
          </Route>
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
