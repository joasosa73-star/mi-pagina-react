import { lazy, Suspense } from 'react'

const Admin = lazy(() => import('./pages/Admin.jsx'))
const Pedido = lazy(() => import('./pages/Pedido.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))

function CargandoPagina() {
  return (
    <main className="pagina-cargando" role="status" aria-live="polite">
      <span className="pagina-cargando-punto" />
      <p>Cargando página...</p>
    </main>
  )
}

export default function App() {
  const ruta = window.location.pathname.replace(/\/+$/, '') || '/'
  let Pagina = Home

  if (ruta === '/admin') Pagina = Admin
  if (ruta === '/pedido') Pagina = Pedido

  return (
    <Suspense fallback={<CargandoPagina />}>
      <Pagina />
    </Suspense>
  )
}
