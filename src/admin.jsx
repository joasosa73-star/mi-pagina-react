

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import './styles/admin.css'

const formularioInicial = {
  nombre: '',
  descripcion: '',
  enlace: ''
}

// Genera la ruta de imagen a partir del nombre del proyecto.
function obtenerImagen(nombre) {
  const slug = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug ? `/fotos/${slug}.jpg` : ''
}

// Formatear la fecha del pedido.
function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible'

  const fechaNormalizada = fecha.includes('T')
    ? fecha
    : `${fecha.replace(' ', 'T')}Z`

  const fechaObjeto = new Date(fechaNormalizada)

  if (Number.isNaN(fechaObjeto.getTime())) {
    return fecha
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fechaObjeto)
}

// Generar enlace de WhatsApp.
function obtenerEnlaceWhatsApp(pedido) {
  const telefono = String(pedido.telefono || '').replace(/\D/g, '')

  const mensaje = `Hola ${pedido.nombre}, soy de JOANET. Recibí tu solicitud para crear una página web para tu negocio de ${pedido.tipo_negocio}. Me gustaría conversar con vos sobre tu idea.`

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
}

function Admin() {
  const [estado, setEstado] = useState('verificando')
  const [password, setPassword] = useState('')
  const [proyectos, setProyectos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [cargandoPedidos, setCargandoPedidos] = useState(false)

  // ========================================
  // COMPROBAR SESIÓN
  // ========================================

  useEffect(() => {
    async function comprobarSesion() {
      try {
        const respuesta = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin'
        })

        if (!respuesta.ok) {
          throw new Error('No se pudo comprobar la sesión.')
        }

        const datos = await respuesta.json()

        if (datos.autenticado) {
          await cargarProyectos()
          setEstado('admin')

          try {
            await cargarPedidos()
          } catch (error) {
            console.error(error)

            toast.error('No se pudieron cargar los pedidos', {
              description: error.message
            })
          }
        } else {
          setEstado('login')
        }
      } catch (error) {
        console.error(error)
        setError('No se pudo conectar con el servidor.')
        setEstado('login')
      }
    }

    comprobarSesion()
  }, [])

  // ========================================
  // CARGAR PROYECTOS
  // ========================================

  async function cargarProyectos() {
    const respuesta = await fetch('/api/proyectos', {
      cache: 'no-store',
      credentials: 'same-origin'
    })

    const datos = await respuesta.json()

    if (!respuesta.ok || !Array.isArray(datos)) {
      throw new Error(datos.error || 'No se pudieron cargar los proyectos.')
    }

    setProyectos(datos)
  }

  // ========================================
  // CARGAR PEDIDOS
  // ========================================

  async function cargarPedidos() {
    setCargandoPedidos(true)

    try {
      const respuesta = await fetch('/api/pedidos', {
        cache: 'no-store',
        credentials: 'same-origin'
      })

      const datos = await respuesta.json()

      if (!respuesta.ok || !Array.isArray(datos)) {
        throw new Error(datos.error || 'No se pudieron cargar los pedidos.')
      }

      setPedidos(datos)
    } finally {
      setCargandoPedidos(false)
    }
  }

  // Actualizar los pedidos manualmente.
  async function actualizarPedidos() {
    try {
      await cargarPedidos()

      toast.success('Pedidos actualizados')
    } catch (error) {
      toast.error('No se pudieron actualizar los pedidos', {
        description: error.message
      })
    }
  }

  // ========================================
  // FORMULARIO DE PROYECTOS
  // ========================================

  function manejarCambio(evento) {
    const { name, value } = evento.target

    setFormulario(actual => ({
      ...actual,
      [name]: value
    }))
  }

  // ========================================
  // INICIAR SESIÓN
  // ========================================

  async function iniciarSesion(evento) {
    evento.preventDefault()

    setProcesando(true)
    setError('')

    try {
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ password })
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo iniciar sesión.')
      }

      setPassword('')

      await cargarProyectos()
      setEstado('admin')

      try {
        await cargarPedidos()
      } catch (error) {
        toast.error('No se pudieron cargar los pedidos', {
          description: error.message
        })
      }

      toast.success('¡Bienvenido!', {
        description: 'Sesión de administrador iniciada.'
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setProcesando(false)
    }
  }

  // ========================================
  // GUARDAR O EDITAR PROYECTOS
  // ========================================

  async function guardarProyecto(evento) {
    evento.preventDefault()

    setProcesando(true)
    setError('')

    try {
      const editando = editandoId !== null

      const respuesta = await fetch(
        editando
          ? `/api/proyectos/${editandoId}`
          : '/api/proyectos',
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify(formulario)
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo guardar el proyecto.')
      }

      setFormulario(formularioInicial)
      setEditandoId(null)

      await cargarProyectos()

      toast.success(
        editando ? 'Proyecto actualizado' : 'Proyecto agregado',
        {
          description: editando
            ? 'Los cambios se guardaron correctamente.'
            : 'El nuevo proyecto ya está registrado.'
        }
      )
    } catch (error) {
      toast.error('No se pudo guardar el proyecto', {
        description: error.message
      })
    } finally {
      setProcesando(false)
    }
  }

  // Preparar el formulario para editar.
  function editarProyecto(proyecto) {
    setFormulario({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      enlace: proyecto.enlace
    })

    setEditandoId(proyecto.id)
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Cancelar la edición.
  function cancelarEdicion() {
    setFormulario(formularioInicial)
    setEditandoId(null)
    setError('')
  }

  // ========================================
  // ELIMINAR PROYECTOS
  // ========================================

  async function eliminarProyecto(id) {
    const confirmado = window.confirm(
      '¿Seguro que querés eliminar este proyecto?'
    )

    if (!confirmado) return

    setProcesando(true)
    setError('')

    try {
      const respuesta = await fetch(`/api/proyectos/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo eliminar el proyecto.')
      }

      if (editandoId === id) {
        cancelarEdicion()
      }

      await cargarProyectos()

      toast.success('Proyecto eliminado', {
        description: 'El proyecto se eliminó correctamente.'
      })
    } catch (error) {
      toast.error('No se pudo eliminar el proyecto', {
        description: error.message
      })
    } finally {
      setProcesando(false)
    }
  }

  // ========================================
  // CERRAR SESIÓN
  // ========================================

  async function cerrarSesion() {
    setProcesando(true)

    try {
      const respuesta = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })

      if (!respuesta.ok) {
        throw new Error('No se pudo cerrar la sesión.')
      }

      setProyectos([])
      setPedidos([])
      setFormulario(formularioInicial)
      setEditandoId(null)
      setEstado('login')
      setError('')

      toast.success('Sesión cerrada', {
        description: 'Saliste del administrador correctamente.'
      })
    } catch (error) {
      toast.error('Error al cerrar sesión', {
        description: error.message
      })
    } finally {
      setProcesando(false)
    }
  }

  // ========================================
  // PANTALLA DE COMPROBACIÓN
  // ========================================

  if (estado === 'verificando') {
    return (
      <main className="admin-pagina">
        <p className="admin-cargando">Comprobando acceso...</p>
      </main>
    )
  }

  // ========================================
  // PANTALLA DE INICIO DE SESIÓN
  // ========================================

  if (estado === 'login') {
    return (
      <main className="admin-pagina admin-login">
        <a href="/" className="admin-logo">JOANET<span>.</span></a>

        <form className="admin-login-form" onSubmit={iniciarSesion}>
          <span className="admin-etiqueta">ÁREA PRIVADA</span>

          <h1>Administrador<span>.</span></h1>

          <p>Ingresá tu contraseña para administrar tus proyectos.</p>

          <label htmlFor="admin-password">Contraseña</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={evento => setPassword(evento.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
          />

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" disabled={procesando}>
            {procesando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <a href="/" className="admin-volver">Volver al sitio</a>
        </form>
      </main>
    )
  }

  // ========================================
  // PANEL DE ADMINISTRACIÓN
  // ========================================

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
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="admin-contenido">

        {/* TÍTULO */}
        <div className="admin-titulo">
          <span className="admin-etiqueta">GESTIÓN DEL SITIO</span>
          <h1>Mis proyectos<span>.</span></h1>
          <p>Agregá, editá o eliminá los proyectos de tu portafolio.</p>
        </div>

        {/* FORMULARIO DE PROYECTOS */}
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

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-acciones-formulario">
            <button type="submit" disabled={procesando}>
              {procesando
                ? 'Guardando...'
                : editandoId
                  ? 'Guardar cambios'
                  : 'Agregar proyecto'}
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

        {/* LISTADO DE PROYECTOS */}
        <section className="admin-listado">
          <div className="admin-listado-titulo">
            <h2>Proyectos publicados</h2>
            <span>{proyectos.length} en total</span>
          </div>

          {proyectos.length === 0 ? (
            <p className="admin-vacio">Todavía no hay proyectos registrados.</p>
          ) : (
            <div className="admin-proyectos">
              {proyectos.map(proyecto => (
                <article className="admin-proyecto" key={proyecto.id}>
                  <img
                    src={proyecto.imagen}
                    alt={`Imagen de ${proyecto.nombre}`}
                  />

                  <div className="admin-proyecto-info">
                    <h3>{proyecto.nombre}</h3>
                    <p>{proyecto.descripcion}</p>

                    <a
                      href={proyecto.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver página ↗
                    </a>
                  </div>

                  <div className="admin-proyecto-acciones">
                    <button
                      type="button"
                      onClick={() => editarProyecto(proyecto)}
                      disabled={procesando}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="admin-eliminar"
                      onClick={() => eliminarProyecto(proyecto.id)}
                      disabled={procesando}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ===================================
            NUEVA SECCIÓN: PEDIDOS
        =================================== */}

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
                {cargandoPedidos ? 'Actualizando...' : '↻ Actualizar'}
              </button>
            </div>
          </div>

          {cargandoPedidos ? (
            <p className="admin-vacio">Cargando solicitudes...</p>
          ) : pedidos.length === 0 ? (
            <div className="admin-pedidos-vacio">
              <span className="admin-pedidos-icono">✉</span>
              <h3>Todavía no hay solicitudes.</h3>
              <p>Cuando un cliente complete el formulario, su pedido aparecerá acá.</p>
            </div>
          ) : (
            <div className="admin-pedidos-lista">

              {pedidos.map(pedido => (
                <article className="admin-pedido" key={pedido.id}>

                  <div className="admin-pedido-superior">
                    <span className="admin-pedido-id">
                      SOLICITUD #{String(pedido.id).padStart(3, '0')}
                    </span>

                    <span className="admin-pedido-estado">
                      <span></span>
                      {pedido.estado || 'Pendiente'}
                    </span>
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
                      <p className="admin-pedido-telefono">
                        +{pedido.telefono}
                      </p>
                    </div>

                    <div>
                      <span>FECHA DE SOLICITUD</span>
                      <p>{formatearFecha(pedido.creado_en)}</p>
                    </div>

                  </div>

                  <div className="admin-pedido-pie">
                    <span>Solicitud recibida correctamente</span>

                    <a
                      href={obtenerEnlaceWhatsApp(pedido)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-pedido-mensaje"
                    >
                      Mensaje <span aria-hidden="true">↗</span>
                    </a>
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

export default Admin
