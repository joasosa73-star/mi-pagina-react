
import './styles/hero.css'

function Hero() {
  return (
    <section className="hero" id="inicio">

      <div className="hero-contenido">

        <span className="hero-etiqueta">
          DESARROLLADOR WEB
        </span>

        <h1>
          Hola, soy <span>JOANET.</span>
          <br />
          Desarrollo experiencias digitales.
        </h1>

        <p className="hero-descripcion">
          Creo páginas web modernas, funcionales y adaptables
          a cualquier dispositivo. Actualmente sigo aprendiendo
          y desarrollando nuevos proyectos.
        </p>

        <div className="hero-botones">

          <a href="#proyectos" className="hero-btn principal">
            Ver proyectos
            <span className="flecha">→</span>
          </a>

          <a href="#contacto" className="hero-btn secundario">
            Contactarme
            <span className="flecha">→</span>
          </a>

        </div>

      </div>

    </section>
  )
}

export default Hero

