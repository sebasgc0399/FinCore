import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { NotFoundPage } from "@/app/pages/NotFoundPage"
import { PrivacyPage } from "@/app/pages/PrivacyPage"
import { TermsPage } from "@/app/pages/TermsPage"
import { LoginPage } from "@/features/auth/components/LoginPage"

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/login" />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<TermsPage />} path="/terms" />
        <Route element={<PrivacyPage />} path="/privacy" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}
