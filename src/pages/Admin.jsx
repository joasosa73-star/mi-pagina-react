import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  LogOut,
  RefreshCw,
  Trash2,
  Pencil,
  MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'
import '../styles/pages/admin.css'

const FORMULARIO_INICIAL = {
  nombre: '',
  descripcion: '',
  enlace: ''
}

function obtenerImagen(nombre) {
  const slug = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug ? `/fotos/${slug}.jpg` : ''
}

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible'
  const normalizada = fecha.includes('T') ? fecha : `${fecha.replace(' ', 'T')}Z`
  const valor = new Date(normalizada)
  if (Number.isNaN(valor.getTime())) return fecha

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(valor)
}

function enlaceWhatsApp(pedido) {
  const telefono = String(pedido.telefono || '').replace(/\D/g, '')
  const mensaje = `Hola ${pedido.nombre}, soy de JOANET. Recibí tu solicitud para crear una página web para tu negocio de ${pedido.tipo_negocio}. Me gustaría conversar con vos sobre tu idea.`
  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
}

async function leerJson(respuesta) {
  let datos
  try {
    datos = await respuesta.json()
  } catch {
    throw new Error('El servidor devolvió una respuesta no válida.')
  }
  if (!respuesta.ok) throw new Error(datos.error || 'Ocurrió un error en el servidor.')
  return datos
}

export default function Admin() {
  const [estado, setEstado] = useState('verificando')
  const [password, setPassword] = useState('')
  const [proyectos, setProyectos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [cargandoPedidos, setCargandoPedidos] = useState(false)

  async function cargarProyectos({ signal } = {}) {
    const respuesta = await fetch('/api/proyectos', {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal
    })
    const datos = await leerJson(respuesta)
    if (!Array.isArray(datos)) throw new Error('La lista de proyectos no es válida.')
    if (!signal?.aborted) setProyectos(datos)
    return datos
  }

  async function cargarPedidos({ signal } = {}) {
    if (!signal?.aborted) setCargandoPedidos(true)
    try {
      const respuesta = await fetch('/api/pedidos', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        signal
      })
      const datos = await leerJson(respuesta)
      if (!Array.isArray(datos)) throw new Error('La lista de pedidos no es válida.')
      if (!signal?.aborted) setPedidos(datos)
      return datos
    } finally {
      if (!signal?.aborted) setCargandoPedidos(false)
    }
  }

  useEffect(() => {
    const controlador = new AbortController()

    async function comprobarSesion() {
      try {
        const respuesta = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          signal: controlador.signal
        })
        const datos = await leerJson(respuesta)
        if (controlador.signal.aborted) return

        if (!datos.autenticado) {
          setEstado('login')
          return
        }

        setEstado('admin')
        await Promise.all([
          cargarProyectos({ signal: controlador.signal }),
          cargarPedidos({ signal: controlador.signal })
        ])
      } catch (err) {
        if (controlador.signal.aborted) return
        console.error('Error al comprobar la sesión:', err)
        setError('No se pudo conectar con el servidor. Probá nuevamente.')
        setEstado('login')
      }
    }

    comprobarSesion()
    return () => controlador.abort()
  }, [])

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  async function iniciarSesion(evento) {
    evento.preventDefault()
    setProcesando(true)
    setError('')

    try {
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ password })
      })
      await leerJson(respuesta)
      setPassword('')
      setEstado('admin')

      try {
        await Promise.all([cargarProyectos(), cargarPedidos()])
      } catch (err) {
        toast.error('La sesión se inició, pero no se cargaron todos los datos.', {
          description: err.message
        })
      }

      toast.success('¡Bienvenido!', {
        description: 'Sesión de administrador iniciada.'
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(false)
    }
  }

  async function guardarProyecto(evento) {
    evento.preventDefault()
    setProcesando(true)
    setError('')

    try {
      const editando = editandoId !== null
      const respuesta = await fetch(
        editando ? `/api/proyectos/${editandoId}` : '/api/proyectos',
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify(formulario)
        }
      )
      await leerJson(respuesta)
      await cargarProyectos()
      setFormulario(FORMULARIO_INICIAL)
      setEditandoId(null)
      toast.success(editando ? 'Proyecto actualizado' : 'Proyecto agregado')
    } catch (err) {
      toast.error('No se pudo guardar el proyecto', { description: err.message })
    } finally {
      setProcesando(false)
    }
  }

  function editarProyecto(proyecto) {
    setFormulario({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      enlace: proyecto.enlace
    })
    setEditandoId(proyecto.id)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setFormulario(FORMULARIO_INICIAL)
    setEditandoId(null)
    setError('')
  }

  async function eliminarProyecto(id) {
    if (!window.confirm('¿Seguro que querés eliminar este proyecto?')) return
    setProcesando(true)
    try {
      const respuesta = await fetch(`/api/proyectos/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      })
      await leerJson(respuesta)
      if (editandoId === id) cancelarEdicion()
      await cargarProyectos()
      toast.success('Proyecto eliminado')
    } catch (err) {
      toast.error('No se pudo eliminar el proyecto', { description: err.message })
    } finally {
      setProcesando(false)
    }
  }

  async function actualizarPedidos() {
    try {
      await cargarPedidos()
      toast.success('Solicitudes actualizadas')
    } catch (err) {
      toast.error('No se pudieron actualizar las solicitudes', { description: err.message })
    }
  }

  async function eliminarPedido(id) {
    if (!window.confirm(`¿Seguro que querés eliminar la solicitud #${id}? Esta acción no se puede deshacer.`)) return
    setProcesando(true)
    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ id })
      })
      await leerJson(respuesta)
      await cargarPedidos()
      toast.success('Solicitud eliminada', {
        description: `El pedido #${id} fue eliminado correctamente.`
      })
    } catch (err) {
      toast.error('No se pudo eliminar la solicitud', { description: err.message })
    } finally {
      setProcesando(false)
    }
  }

  async function cerrarSesion() {
    setProcesando(true)
    try {
      const respuesta = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      })
      await leerJson(respuesta)
      setProyectos([])
      setPedidos([])
      setFormulario(FORMULARIO_INICIAL)
      setEditandoId(null)
      setEstado('login')
      setError('')
      toast.success('Sesión cerrada')
    } catch (err) {
      toast.error('No se pudo cerrar la sesión', { description: err.message })
    } finally {
      setProcesando(false)
    }
  }

  if (estado === 'verificando') {
    return (
      <main className="admin-pagina">
        <p className="admin-cargando">Comprobando acceso...</p>
      </main>
    )
  }

  if (estado === 'login') {
    return (
      <main className="admin-pagina admin-login">
        <a href="/" className="admin-logo">JOANET<span>.</span></a>
        <form className="admin-login-form" onSubmit={iniciarSesion}>
          <span className="admin-etiqueta">ÁREA PRIVADA</span>
          <h1>Administrador<span>.</span></h1>
          <p>Ingresá tu contraseña para administrar tus proyectos y solicitudes.</p>
          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            maxLength={200}
            required
          />
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" disabled={procesando}>
            {procesando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
          <a href="/" className="admin-volver">Volver al sitio</a>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-pagina">
      <header className="admin-barra">
        <a href="/" className="admin-logo">JOANET<span>.</span></a>
        <div className="admin-barra-derecha">
          <span>Panel de administración</span>
          <button
            type="button"
            className="admin-salir"
            onClick={cerrarSesion}
            disabled={procesando}
          >
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </header>

      <section className="admin-contenido">
        <div className="admin-titulo">
          <span className="admin-etiqueta">GESTIÓN DEL SITIO</span>
          <h1>Mis proyectos<span>.</span></h1>
          <p>Agregá, editá o eliminá los proyectos de tu portafolio.</p>
        </div>

        <form className="admin-formulario" onSubmit={guardarProyecto}>
          <div className="admin-formulario-titulo">
            <h2>{editandoId ? 'Editar proyecto' : 'Agregar proyecto'}</h2>
            <span>{editandoId ? `ID ${editandoId}` : 'NUEVO'}</span>
          </div>

          <label htmlFor="proyecto-nombre">Nombre del proyecto</label>
          <input
            id="proyecto-nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej.: Mi sitio web"
            maxLength={100}
            required
          />

          <label htmlFor="proyecto-descripcion">Descripción</label>
          <textarea
            id="proyecto-descripcion"
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Contá brevemente de qué trata el proyecto."
            maxLength={500}
            rows={4}
            required
          />

          <label htmlFor="proyecto-enlace">Enlace de la página</label>
          <input
            id="proyecto-enlace"
            name="enlace"
            type="url"
            value={formulario.enlace}
            onChange={manejarCambio}
            placeholder="https://ejemplo.pages.dev/"
            maxLength={2000}
            required
          />

          <div className="admin-imagen-ayuda">
            <span>Imagen asociada:</span>
            <code>{obtenerImagen(formulario.nombre) || 'Se generará al escribir el nombre'}</code>
            <p>Colocá previamente ese archivo JPG dentro de <code>public/fotos/</code>.</p>
          </div>

          {error && <p className="admin-error" role="alert">{error}</p>}

          <div className="admin-acciones-formulario">
            <button type="submit" disabled={procesando}>
              {procesando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar proyecto'}
            </button>
            {editandoId !== null && (
              <button
                type="button"
                className="admin-cancelar"
                onClick={cancelarEdicion}
                disabled={procesando}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <section className="admin-listado">
          <div className="admin-listado-titulo">
            <h2>Proyectos publicados</h2>
            <span>{proyectos.length} en total</span>
          </div>
          {proyectos.length === 0 ? (
            <p className="admin-vacio">Todavía no hay proyectos registrados.</p>
          ) : (
            <div className="admin-proyectos">
              {proyectos.map((proyecto) => (
                <article className="admin-proyecto" key={proyecto.id}>
                  <img src={proyecto.imagen} alt={`Imagen de ${proyecto.nombre}`} loading="lazy" decoding="async" />
                  <div className="admin-proyecto-info">
                    <h3>{proyecto.nombre}</h3>
                    <p>{proyecto.descripcion}</p>
                    <a href={proyecto.enlace} target="_blank" rel="noopener noreferrer">
                      Ver página <ArrowUpRight size={13} />
                    </a>
                  </div>
                  <div className="admin-proyecto-acciones">
                    <button type="button" onClick={() => editarProyecto(proyecto)} disabled={procesando}>
                      <Pencil size={13} /> Editar
                    </button>
                    <button type="button" className="admin-eliminar" onClick={() => eliminarProyecto(proyecto.id)} disabled={procesando}>
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-listado admin-pedidos-seccion" id="pedidos">
          <div className="admin-listado-titulo admin-pedidos-titulo">
            <div>
              <span className="admin-etiqueta">CLIENTES</span>
              <h2>Solicitudes recibidas</h2>
            </div>
            <div className="admin-pedidos-controles">
              <span>{pedidos.length} en total</span>
              <button
                type="button"
                className="admin-actualizar-pedidos"
                onClick={actualizarPedidos}
                disabled={cargandoPedidos}
              >
                <RefreshCw size={14} className={cargandoPedidos ? 'admin-girando' : ''} />
                {cargandoPedidos ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {cargandoPedidos ? (
            <p className="admin-vacio">Cargando solicitudes...</p>
          ) : pedidos.length === 0 ? (
            <div className="admin-pedidos-vacio">
              <MessageCircle size={30} className="admin-pedidos-icono" />
              <h3>Todavía no hay solicitudes.</h3>
              <p>Cuando un cliente complete el formulario, su pedido aparecerá acá.</p>
            </div>
          ) : (
            <div className="admin-pedidos-lista">
              {pedidos.map((pedido) => (
                <article className="admin-pedido" key={pedido.id}>
                  <div className="admin-pedido-superior">
                    <span className="admin-pedido-id">SOLICITUD #{String(pedido.id).padStart(3, '0')}</span>
                    <span className="admin-pedido-estado"><span />{pedido.estado || 'Pendiente'}</span>
                  </div>
                  <div className="admin-pedido-datos">
                    <div className="admin-pedido-cliente">
                      <span>CLIENTE</span>
                      <h3>{pedido.nombre}</h3>
                    </div>
                    <div>
                      <span>TIPO DE NEGOCIO</span>
                      <p>{pedido.tipo_negocio}</p>
                    </div>
                    <div>
                      <span>WHATSAPP</span>
                      <p className="admin-pedido-telefono">+{pedido.telefono}</p>
                    </div>
                    <div>
                      <span>FECHA DE SOLICITUD</span>
                      <p>{formatearFecha(pedido.creado_en)}</p>
                    </div>
                  </div>
                  <div className="admin-pedido-pie">
                    <span>Solicitud recibida correctamente</span>
                    <div className="admin-pedido-acciones">
                      <a href={enlaceWhatsApp(pedido)} target="_blank" rel="noopener noreferrer" className="admin-pedido-mensaje">
                        Mensaje <ArrowUpRight size={15} />
                      </a>
                      <button
                        type="button"
                        className="admin-pedido-eliminar"
                        onClick={() => eliminarPedido(pedido.id)}
                        disabled={procesando}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <a href="/" className="admin-volver">← Volver al sitio</a>
      </section>
    </main>
  )
}
