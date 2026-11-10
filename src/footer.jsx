
import './styles/footer.css'

function Footer() {
  const anio = new Date().getFullYear()

  return (
    <footer className="footer">

      <div className="footer-contenido">

        {/* IDENTIDAD */}
        <div className="footer-marca">
          <a href="#inicio" className="footer-logo">
            JOANET<span>.</span>
          </a>

          <p>
            Desarrollo web y experiencias digitales.
            Creando sitios modernos, funcionales y únicos.
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div className="footer-navegacion">
          <h3>NAVEGACIÓN</h3>

          <a href="#inicio">Inicio</a>
          <a href="#sobre-mi">Sobre mí</a>
          <a href="#servicios">Servicios</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#contacto">Contacto</a>
        </div>

        {/* CONTACTO */}
        <div className="footer-contacto">
          <h3>CONTACTO</h3>

          <a href="#contacto">
            Hablemos de tu proyecto <span>↗</span>
          </a>
        </div>

      </div>

      {/* PARTE INFERIOR */}
      <div className="footer-inferior">

        <p>© {anio} JOANET. Todos los derechos reservados.</p>

        <div className="footer-acciones">

          <a href="/admin" className="footer-admin">
            ADMIN <span>↗</span>
          </a>

          <a href="#inicio" className="footer-volver">
            VOLVER ARRIBA <span>↑</span>
          </a>

        </div>

      </div>

    </footer>
  )
}

export default Footer
