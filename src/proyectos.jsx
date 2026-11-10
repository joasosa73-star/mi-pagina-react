import { useEffect, useState } from 'react'
import './styles/proyectos.css'

function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Cargar proyectos desde la API de Cloudflare.
  useEffect(() => {
    const controlador = new AbortController()

    fetch('/api/proyectos', {
      signal: controlador.signal
    })
      .then(respuesta => {
        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los proyectos.')
        }

        return respuesta.json()
      })
      .then(datos => {
        if (!Array.isArray(datos)) {
          throw new Error('La respuesta del servidor no es válida.')
        }

        setProyectos(datos)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error al cargar proyectos:', error)
          setError('No se pudieron cargar los proyectos.')
        }
      })
      .finally(() => {
        setCargando(false)
      })

    return () => controlador.abort()
  }, [])

  return (
    <section className="proyectos" id="proyectos">

      {/* ENCABEZADO */}
      <div className="proyectos-encabezado">
        <span className="proyectos-etiqueta">MI TRABAJO</span>

        <h2>
          Proyectos<span>.</span>
        </h2>

        <p>
          Una selección de páginas web que fui diseñando y desarrollando.
        </p>
      </div>

      {/* ESTADOS DE CARGA */}
      {cargando && (
        <p className="proyectos-estado">
          Cargando proyectos...
        </p>
      )}

      {error && (
        <p className="proyectos-estado">
          {error}
        </p>
      )}

      {!cargando && !error && proyectos.length === 0 && (
        <p className="proyectos-estado">
          Próximamente nuevos proyectos.
        </p>
      )}

      {/* CARRUSEL */}
      {proyectos.length > 0 && (
        <div className="proyectos-carrusel">

          <div className="proyectos-pista">

            {/* Primera lista */}
            {proyectos.map(proyecto => (
              <a
                className="proyecto-card"
                href={proyecto.enlace}
                target="_blank"
                rel="noopener noreferrer"
                key={`original-${proyecto.id}`}
              >
                <div className="proyecto-imagen">
                  <img
                    src={proyecto.imagen}
                    alt={proyecto.nombre}
                  />

                  <span className="proyecto-flecha">↗</span>
                </div>

                <div className="proyecto-info">
                  <div>
                    <h3>{proyecto.nombre}</h3>
                    <p>{proyecto.descripcion}</p>
                  </div>

                  <span className="proyecto-numero">
                    {String(proyecto.id).padStart(2, '0')}
                  </span>
                </div>
              </a>
            ))}

            {/* Segunda lista: permite el movimiento infinito */}
            {proyectos.map(proyecto => (
              <a
                className="proyecto-card"
                href={proyecto.enlace}
                target="_blank"
                rel="noopener noreferrer"
                key={`duplicado-${proyecto.id}`}
                aria-hidden="true"
                tabIndex={-1}
              >
                <div className="proyecto-imagen">
                  <img
                    src={proyecto.imagen}
                    alt=""
                  />

                  <span className="proyecto-flecha">↗</span>
                </div>

                <div className="proyecto-info">
                  <div>
                    <h3>{proyecto.nombre}</h3>
                    <p>{proyecto.descripcion}</p>
                  </div>

                  <span className="proyecto-numero">
                    {String(proyecto.id).padStart(2, '0')}
                  </span>
                </div>
              </a>
            ))}

          </div>
        </div>
      )}

    </section>
  )
}

export default Proyectos