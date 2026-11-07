
import './App.css'

// Componente del encabezado
function Header() {
  return (
    <header className="header">
    
      {/* LOGO */}
      <a href="#inicio" className="logo">
        <span>&lt;/&gt;</span> JOANET
      </a>
      <label for="menu-toggle" class="menu-boton" aria-label="Mostrar u ocultar menú">
        <span></span>
        <span></span>
        <span></span>
      </label>
      {/* MENÚ */}
      <nav className="nav">
        <a href="#inicio">Inicio</a>
        <a href="#sobre-mi">Sobre mí</a>
        <a href="#servicios">Servicios</a>
        <a href="#proyectos">Proyectos</a>
        <a href="#contacto" className="contacto-link">
          Contacto
        </a>
      </nav>

    </header>
  )
}
// COMPONENTE DE PORTADA
function Hero() {
  return (
    <section className="hero" id="inicio">

      {/* PRESENTACIÓN */}
      <div className="hero-contenido">

        <p className="hero-etiqueta">
          ● DESARROLLADOR WEB
        </p>

        <p className="hero-saludo">
          Hola, soy desarrollador web
        </p>

        <h1>
          Creo experiencias
          <span> digitales únicas.</span>
        </h1>

        <p className="hero-descripcion">
          Diseño y desarrollo sitios web modernos,
          funcionales y adaptables a cualquier dispositivo.
          Transformo ideas en experiencias digitales.
        </p>

        {/* BOTONES */}
        <div className="hero-botones">
          <a href="#proyectos" className="btn-principal">
            Ver mis proyectos ↗
          </a>

          <a href="#sobre-mi" className="btn-secundario">
            Conoceme
          </a>
        </div>

        {/* TECNOLOGÍAS */}
        <div className="hero-tecnologias">
          <span>TECNOLOGÍAS:</span>
          <strong>HTML</strong>
          <strong>CSS</strong>
          <strong>JavaScript</strong>
          <strong>React</strong>
        </div>

      </div>

      {/* TARJETA DE CÓDIGO */}
      <div className="hero-visual">

        <div className="code-window">

          <div className="code-header">
            <div className="code-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <p>developer.jsx</p>
          </div>

          <div className="code-content">
            <p><span className="purple">const</span> developer = {'{'}</p>

            <p className="indent">
              nombre: <span className="green">'Tu Nombre'</span>,
            </p>

            <p className="indent">
              profesion: <span className="green">'Web Developer'</span>,
            </p>

            <p className="indent">skills: [</p>

            <p className="indent2">
              <span className="green">'HTML'</span>,
            </p>

            <p className="indent2">
              <span className="green">'CSS'</span>,
            </p>

            <p className="indent2">
              <span className="green">'JavaScript'</span>,
            </p>

            <p className="indent2">
              <span className="green">'React'</span>
            </p>

            <p className="indent">],</p>

            <p className="indent">
              aprendiendo: <span className="orange">true</span>
            </p>

            <p>{'}'}</p>

            <p className="comment">
              // Construyendo el futuro, línea por línea.
            </p>
          </div>

        </div>

      </div>

    </section>
  )
}

// COMPONENTE SOBRE MÍ
function SobreMi() {
  return (
    <section className="sobre-mi" id="sobre-mi">

      {/* COLUMNA IZQUIERDA */}
      <div className="sobre-titulo">
        <p className="etiqueta">01 / SOBRE MÍ</p>

        <h2>
          Detrás de cada línea de código
          <span> hay una idea.</span>
        </h2>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="sobre-contenido">

        <p>
          Soy desarrollador web y me apasiona la tecnología,
          el diseño y la programación.
        </p>

        <p>
          Me gusta crear soluciones digitales que combinen
          estética, funcionalidad y una buena experiencia
          para el usuario.
        </p>

        <p>
          Siempre estoy aprendiendo nuevas herramientas
          y tecnologías para mejorar mis habilidades.
        </p>

        <div className="sobre-datos">
          <div>
            <strong>01.</strong>
            <span>Creatividad</span>
          </div>

          <div>
            <strong>02.</strong>
            <span>Aprendizaje</span>
          </div>

          <div>
            <strong>03.</strong>
            <span>Desarrollo</span>
          </div>
        </div>

      </div>

    </section>
  )
}

// COMPONENTE SERVICIOS
function Servicios() {

  // ARRAY DE SERVICIOS
  const servicios = [
    {
      numero: '01',
      titulo: 'Diseño web',
      descripcion: 'Diseños modernos, atractivos y adaptados a cada dispositivo.',
      icono: '✦'
    },
    {
      numero: '02',
      titulo: 'Desarrollo web',
      descripcion: 'Páginas web rápidas, funcionales y optimizadas.',
      icono: '</>'
    },
    {
      numero: '03',
      titulo: 'Aplicaciones web',
      descripcion: 'Aplicaciones interactivas con tecnologías modernas.',
      icono: '⌘'
    }
  ]

  return (
    <section className="servicios" id="servicios">

      {/* TÍTULO */}
      <div className="servicios-titulo">
        <p className="etiqueta">02 / SERVICIOS</p>

        <h2>¿Qué puedo desarrollar?</h2>

        <p>
          Soluciones digitales para transformar tus ideas.
        </p>
      </div>

      {/* TARJETAS */}
      <div className="servicios-grid">

        {servicios.map((servicio) => (
          <article className="servicio-card" key={servicio.numero}>

            <div className="servicio-top">
              <span>{servicio.numero}</span>
              <span className="servicio-icono">{servicio.icono}</span>
            </div>

            <h3>{servicio.titulo}</h3>

            <p>{servicio.descripcion}</p>

            <span className="servicio-flecha">↗</span>

          </article>
        ))}

      </div>

    </section>
  )
}

// COMPONENTE PROYECTOS
function Proyectos() {

  // ARRAY DE PROYECTOS
  const proyectos = [
    {
      numero: '01',
      titulo: 'Chino Barber',
      categoria: 'Sitio web para barbería',
      tecnologias: 'HTML · CSS · JavaScript',
      descripcion: 'Diseño web moderno con galería y sistema de turnos.',
      url: 'https://chinobarber.pages.dev'
    },
    {
      numero: '02',
      titulo: 'Tuxedo Barbería',
      categoria: 'Desarrollo web',
      tecnologias: 'HTML · CSS · JavaScript',
      descripcion: 'Página web con diseño moderno y galería de cortes.',
      url: 'https://tuxedobarber.pages.dev'
    },
    {
      numero: '03',
      titulo: 'Mi primer proyecto React',
      categoria: 'Desarrollo frontend',
      tecnologias: 'React · JavaScript · CSS',
      descripcion: 'Mi primer proyecto desarrollado utilizando React.',
      url: 'https://github.com/joasosa73-star/mi-pagina-react'
    }
  ]

  return (
    <section className="proyectos" id="proyectos">

      {/* TÍTULO */}
      <div className="proyectos-titulo">

        <p className="etiqueta">03 / PORTAFOLIO</p>

        <h2>Mis proyectos.</h2>

        <p>
          Algunos de mis trabajos y experiencias
          en el desarrollo web.
        </p>

      </div>

      {/* TARJETAS */}
      <div className="proyectos-grid">

        {proyectos.map((proyecto) => (

          <article
            className="proyecto-card"
            key={proyecto.numero}
          >

            {/* IMAGEN REPRESENTATIVA */}
            <div className={`proyecto-imagen proyecto-${proyecto.numero}`}>

              <span className="proyecto-numero">
                {proyecto.numero}
              </span>

              <span className="proyecto-icono">
                &lt;/&gt;
              </span>

            </div>

            {/* INFORMACIÓN */}
            <div className="proyecto-info">

              <p className="proyecto-categoria">
                {proyecto.categoria}
              </p>

              <h3>{proyecto.titulo}</h3>

              <p className="proyecto-descripcion">
                {proyecto.descripcion}
              </p>

              <span className="proyecto-tecnologias">
                {proyecto.tecnologias}
              </span>

              {/* ENLACE */}
              <a
                href={proyecto.url}
                target="_blank"
                rel="noreferrer"
                className="proyecto-enlace"
              >
                Ver proyecto ↗
              </a>

            </div>

          </article>

        ))}

      </div>

    </section>
  )
}

// COMPONENTE HABILIDADES
function Habilidades() {

  // ARRAY DE TECNOLOGÍAS
  const tecnologias = [
    {
      nombre: 'HTML5',
      descripcion: 'Estructura web',
      icono: '🌐'
    },
    {
      nombre: 'CSS3',
      descripcion: 'Diseño y estilos',
      icono: '🎨'
    },
    {
      nombre: 'JavaScript',
      descripcion: 'Programación',
      icono: '⚡'
    },
    {
      nombre: 'React',
      descripcion: 'Interfaces dinámicas',
      icono: '⚛'
    },
    {
      nombre: 'Git',
      descripcion: 'Control de versiones',
      icono: '🔧'
    },
    {
      nombre: 'GitHub',
      descripcion: 'Gestión de proyectos',
      icono: '🐙'
    }
  ]

  return (
    <section className="habilidades" id="habilidades">

      {/* TÍTULO */}
      <div className="habilidades-titulo">
        <p className="etiqueta">04 / TECNOLOGÍAS</p>

        <h2>Herramientas que utilizo.</h2>

        <p>
          Tecnologías que forman parte de mi proceso
          de aprendizaje y desarrollo.
        </p>
      </div>

      {/* TARJETAS */}
      <div className="habilidades-grid">

        {tecnologias.map((tecnologia) => (

          <article
            className="habilidad-card"
            key={tecnologia.nombre}
          >

            <span className="habilidad-icono">
              {tecnologia.icono}
            </span>

            <h3>{tecnologia.nombre}</h3>

            <p>{tecnologia.descripcion}</p>

          </article>

        ))}

      </div>

    </section>
  )
}

// COMPONENTE CONTACTO
function Contacto() {
  return (
    <section className="contacto" id="contacto">

      <p className="etiqueta">05 / CONTACTO</p>

      <h2>
        ¿Tenés una idea?
        <span> Hagámosla realidad.</span>
      </h2>

      <p className="contacto-descripcion">
        Estoy interesado en conocer nuevos proyectos,
        desarrollar ideas y crear experiencias digitales.
      </p>

      <div className="contacto-botones">

        <a
          href="mailto:tuemail@ejemplo.com"
          className="btn-principal"
        >
          Enviarme un correo ↗
        </a>

        <a
          href="https://github.com/joasosa73-star"
          target="_blank"
          rel="noreferrer"
          className="btn-secundario"
        >
          Mi GitHub ↗
        </a>

      </div>

    </section>
  )
}


// COMPONENTE FOOTER
function Footer() {
  return (
    <footer className="footer">

      <a href="#inicio" className="logo">
        <span>&lt;/&gt;</span> DEVPORTFOLIO
      </a>

      <p>
        Diseñado y desarrollado con React.
      </p>

      <div className="footer-redes">
        <a
          href="https://github.com/joasosa73-star"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </div>

      <span>
        © {new Date().getFullYear()} · Todos los derechos reservados.
      </span>

    </footer>
  )
}

// Componente principal
function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SobreMi />
        <Servicios />
        <Proyectos />
        <Habilidades />
      </main>
      <Footer />
    </>
  )
}

export default App
