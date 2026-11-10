
import { useState, useRef } from 'react'
import './styles/App.css'
import Hero from './hero'
import Proyectos from './proyectos'
import Footer from './footer'
import Admin from './admin'

function Header() {

  const [menuAbierto, setMenuAbierto] = useState(false)

  const botonMenu = useRef(null)

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  const alternarMenu = () => {
    setMenuAbierto((estado) => !estado)
  }

  const manejarTecla = (e) => {
    if (e.key === 'Escape') {
      cerrarMenu()
      botonMenu.current?.focus()
    }
  }

  return (
    <header className="header" onKeyDown={manejarTecla}>

      {/* LOGO */}
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

      {/* BOTÓN HAMBURGUESA */}
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

      {/* NAVEGACIÓN */}
      <nav
        id="menu-principal"
        className={menuAbierto ? 'nav activo' : 'nav'}
        aria-label="Navegación principal"
      >

        <a href="#inicio" onClick={cerrarMenu}>
          Inicio
        </a>

        <a href="#proyectos" onClick={cerrarMenu}>
          Proyectos
        </a>

        <a href="#servicios" onClick={cerrarMenu}>
          Servicios
        </a>

        <a href="#sobre-mi" onClick={cerrarMenu}>
          Sobre mí
        </a>

        <a
          href="#contacto"
          className="contacto-link"
          onClick={cerrarMenu}
        >
          Contacto <span aria-hidden="true">↗</span>
        </a>

      </nav>

    </header>
  )
}


// Componente principal.
function App() {
  const ruta = window.location.pathname.replace(/\/+$/, '') || '/'

  // Mostrar el administrador en /admin.
  if (ruta === '/admin') {
    return <Admin />
  }

  // Página pública.
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
