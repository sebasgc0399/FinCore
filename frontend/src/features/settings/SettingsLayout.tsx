import { Outlet } from "react-router-dom"

export const SettingsLayout = () => {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-2">
      <Outlet />
    </div>
  )
}
