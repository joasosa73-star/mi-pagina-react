
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import './styles/proyectos.css'

function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // CARGAR PROYECTOS DESDE CLOUDFLARE
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

  // TARJETA DE PROYECTO
  const TarjetaProyecto = ({ proyecto, duplicado = false, indice = 0 }) => (
    <motion.a
      className="proyecto-card"
      href={proyecto.enlace}
      target="_blank"
      rel="noopener noreferrer"
      key={`${duplicado ? 'duplicado' : 'original'}-${proyecto.id}`}
      aria-hidden={duplicado ? 'true' : undefined}
      tabIndex={duplicado ? -1 : 0}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(indice * 0.08, 0.4),
        ease: 'easeOut'
      }}
      whileHover={{
        y: -8,
        scale: 1.01
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="proyecto-imagen">
        <img
          src={proyecto.imagen}
          alt={duplicado ? '' : proyecto.nombre}
          loading="lazy"
        />

        <motion.span
          className="proyecto-flecha"
          whileHover={{ scale: 1.12, rotate: 45 }}
        >
          <ArrowUpRight size={22} />
        </motion.span>
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
    </motion.a>
  )

  return (
    <section className="proyectos" id="proyectos">

      {/* ENCABEZADO */}
      <motion.div
        className="proyectos-encabezado"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <span className="proyectos-etiqueta">
          MI TRABAJO
        </span>

        <h2>
          Proyectos<span>.</span>
        </h2>

        <p>
          Una selección de páginas web que fui diseñando y desarrollando.
        </p>
      </motion.div>

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

      {/* CARRUSEL INFINITO */}
      {!cargando && !error && proyectos.length > 0 && (
        <motion.div
          className="proyectos-carrusel"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="proyectos-pista">

            {/* PRIMERA LISTA */}
            {proyectos.map((proyecto, indice) => (
              <TarjetaProyecto
                proyecto={proyecto}
                indice={indice}
                key={`original-${proyecto.id}`}
              />
            ))}

            {/* SEGUNDA LISTA PARA EL MOVIMIENTO INFINITO */}
            {proyectos.map((proyecto, indice) => (
              <TarjetaProyecto
                proyecto={proyecto}
                indice={indice}
                duplicado={true}
                key={`duplicado-${proyecto.id}`}
              />
            ))}

          </div>
        </motion.div>
      )}

    </section>
  )
}

export default Proyectos
