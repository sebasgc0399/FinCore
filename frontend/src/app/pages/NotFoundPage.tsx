import { Link } from "react-router-dom"

export const NotFoundPage = () => {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold">Pagina no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link className="text-sm underline-offset-4 hover:underline" to="/login">
          Volver al inicio de sesion
        </Link>
      </div>
    </main>
  )
}

