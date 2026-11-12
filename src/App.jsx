
import { useState, useRef, lazy, Suspense } from 'react'

import './styles/App.css'

import Hero from './hero'
import Proyectos from './proyectos'
import Footer from './footer'

// Cargar estas páginas solamente cuando se necesiten.
const Admin = lazy(() => import('./admin'))
const Pedido = lazy(() => import('./pedido'))

// Pantalla de carga.
function CargandoPagina() {
  return (
    <main className="admin-pagina">
      <p className="admin-cargando">Cargando página...</p>
    </main>
  )
}

// ========================================
// ENCABEZADO Y NAVEGACIÓN
// ========================================

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenu = useRef(null)

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  const alternarMenu = () => {
    setMenuAbierto(estado => !estado)
  }

  const manejarTecla = (e) => {
    if (e.key === 'Escape') {
      cerrarMenu()
      botonMenu.current?.focus()
    }
  }

  return (
    <header className="header" onKeyDown={manejarTecla}>

      <a
        href="#inicio"
        className="logo"
        aria-label="JOANET - Ir al inicio"
        onClick={cerrarMenu}
      >
        <img
          src="/logo.svg"
          alt="Logo de JOANET"
          className="logo-img"
        />

        <span className="logo-texto">JOANET</span>
      </a>

      <button
        ref={botonMenu}
        type="button"
        className={`menu-boton ${menuAbierto ? 'activo' : ''}`}
        onClick={alternarMenu}
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuAbierto}
        aria-controls="menu-principal"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <nav
        id="menu-principal"
        className={menuAbierto ? 'nav activo' : 'nav'}
        aria-label="Navegación principal"
      >
        <a href="#inicio" onClick={cerrarMenu}>Inicio</a>
        <a href="#proyectos" onClick={cerrarMenu}>Proyectos</a>
        <a href="#servicios" onClick={cerrarMenu}>Servicios</a>
        <a href="#sobre-mi" onClick={cerrarMenu}>Sobre mí</a>

        <a
          href="/pedido"
          className="contacto-link"
          onClick={cerrarMenu}
        >
          Solicitar página <span aria-hidden="true">↗</span>
        </a>

        <a href="#contacto" onClick={cerrarMenu}>Contacto</a>
      </nav>
    </header>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function App() {
  const ruta = window.location.pathname.replace(/\/+$/, '') || '/'

  if (ruta === '/admin') {
    return (
      <Suspense fallback={<CargandoPagina />}>
        <Admin />
      </Suspense>
    )
  }

  if (ruta === '/pedido') {
    return (
      <Suspense fallback={<CargandoPagina />}>
        <Pedido />
      </Suspense>
    )
  }

  return (
    <>
      <Header />

      <main>
        <Hero />
        <Proyectos />
      </main>

      <Footer />
    </>
  )
}

export default App
