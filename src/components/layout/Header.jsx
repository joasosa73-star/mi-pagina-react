import '../../styles/layout/header.css'

export default function Header({
  menuAbierto,
  botonMenu,
  alternarMenu,
  cerrarMenu,
  manejarTecla
}) {
  return (
    <header className="header" onKeyDown={manejarTecla}>
      <a
        href="#inicio"
        className="logo"
        aria-label="JOANET - Ir al inicio"
        onClick={cerrarMenu}
      >
        <img src="/logo.svg" alt="Logo de JOANET" className="logo-img" />
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
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
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
        <a href="/pedido" className="contacto-link" onClick={cerrarMenu}>
          Solicitar página <span aria-hidden="true">↗</span>
        </a>
        <a href="#contacto" onClick={cerrarMenu}>Contacto</a>
      </nav>
    </header>
  )
}
