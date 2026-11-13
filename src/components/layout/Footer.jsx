import '../../styles/layout/footer.css'

const ANIO_ACTUAL = new Date().getFullYear()

export default function Footer() {

  return (
    <footer className="footer">
      <div className="footer-contenido">
        <div className="footer-marca">
          <a href="#inicio" className="footer-logo">JOANET<span>.</span></a>
          <p>
            Desarrollo web y experiencias digitales.
            Creando sitios modernos, funcionales y únicos.
          </p>
        </div>

        <div className="footer-navegacion">
          <h3>NAVEGACIÓN</h3>
          <a href="#inicio">Inicio</a>
          <a href="#sobre-mi">Sobre mí</a>
          <a href="#servicios">Servicios</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#contacto">Contacto</a>
        </div>

        <div className="footer-contacto">
          <h3>TRABAJEMOS JUNTOS</h3>
          <a href="/pedido">
            Solicitar una página web <span>↗</span>
          </a>
        </div>
      </div>

      <div className="footer-inferior">
        <p>© {ANIO_ACTUAL} JOANET. Todos los derechos reservados.</p>
        <div className="footer-acciones">
          <a href="/admin" className="footer-admin">ADMIN <span>↗</span></a>
          <a href="#inicio" className="footer-volver">VOLVER ARRIBA <span>↑</span></a>
        </div>
      </div>
    </footer>
  )
}
