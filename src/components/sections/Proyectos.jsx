import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import '../../styles/sections/proyectos.css'

async function obtenerProyectos({ signal }) {
  const respuesta = await fetch('/api/proyectos', {
    signal,
    headers: { Accept: 'application/json' }
  })

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los proyectos.')
  }

  const datos = await respuesta.json()

  if (!Array.isArray(datos)) {
    throw new Error('La respuesta del servidor no es válida.')
  }

  return datos
}

function TarjetaProyecto({ proyecto, duplicado = false, indice = 0 }) {
  return (
    <motion.a
      className="proyecto-card"
      href={proyecto.enlace}
      target="_blank"
      rel="noopener noreferrer"
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
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="proyecto-imagen">
        <img
          src={proyecto.imagen}
          alt={duplicado ? '' : proyecto.nombre}
          loading="lazy"
          decoding="async"
        />
        <motion.span
          className="proyecto-flecha"
          aria-hidden="true"
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
}

export default function Proyectos() {
  const {
    data: proyectos = [],
    isPending: cargando,
    error
  } = useQuery({
    queryKey: ['proyectos-publicos'],
    queryFn: obtenerProyectos,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false
  })

  return (
    <section className="proyectos" id="proyectos">
      <motion.div
        className="proyectos-encabezado"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <span className="proyectos-etiqueta">MI TRABAJO</span>
        <h2>Proyectos<span>.</span></h2>
        <p>Una selección de páginas web que fui diseñando y desarrollando.</p>
      </motion.div>

      {cargando && <p className="proyectos-estado">Cargando proyectos...</p>}
      {error && <p className="proyectos-estado">No se pudieron cargar los proyectos. Probá nuevamente más tarde.</p>}
      {!cargando && !error && proyectos.length === 0 && (
        <p className="proyectos-estado">Próximamente nuevos proyectos.</p>
      )}

      {!cargando && !error && proyectos.length > 0 && (
        <motion.div
          className="proyectos-carrusel"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="proyectos-pista">
            {proyectos.map((proyecto, indice) => (
              <TarjetaProyecto
                proyecto={proyecto}
                indice={indice}
                key={`original-${proyecto.id}`}
              />
            ))}
            {proyectos.map((proyecto, indice) => (
              <TarjetaProyecto
                proyecto={proyecto}
                indice={indice}
                duplicado
                key={`duplicado-${proyecto.id}`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </section>
  )
}
