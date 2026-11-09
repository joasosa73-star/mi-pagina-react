
import { useState, useRef } from 'react'
import './App.css'
import Hero from './hero'

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

        <a href="#sobre-mi" onClick={cerrarMenu}>
          Sobre mí
        </a>

        <a href="#servicios" onClick={cerrarMenu}>
          Servicios
        </a>

        <a href="#proyectos" onClick={cerrarMenu}>
          Proyectos
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


// Componente principal
function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        
      </main>
      
    </>
  )
}

export default App
