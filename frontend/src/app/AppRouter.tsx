import { BrowserRouter, Route, Routes } from "react-router-dom"

import { DashboardPage } from "@/app/pages/DashboardPage"
import { NotFoundPage } from "@/app/pages/NotFoundPage"
import { PrivacyPage } from "@/app/pages/PrivacyPage"
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
              <DashboardPage />
            </ProtectedRoute>
          }
          path="/"
        />
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

