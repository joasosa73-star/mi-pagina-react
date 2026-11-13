import { verifySession } from '../../_lib/auth.js'
import { imagePathFromName } from '../../_lib/projects.js'
import { isSameOrigin } from '../../_lib/security.js'

const NO_STORE = { 'Cache-Control': 'no-store' }
const encoder = new TextEncoder()

async function leerDatosProyecto(request) {
  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('FORMAT')
  }

  const cuerpo = await request.text()
  if (encoder.encode(cuerpo).byteLength > 16 * 1024) {
    throw new Error('TOO_LARGE')
  }

  try {
    const datos = JSON.parse(cuerpo)
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      throw new Error('INVALID')
    }
    return datos
  } catch {
    throw new Error('INVALID')
  }
}

function validarId(valor) {
  const id = Number(valor)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function validarProyecto(datos) {
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : ''
  const descripcion = typeof datos.descripcion === 'string' ? datos.descripcion.trim() : ''
  const enlace = typeof datos.enlace === 'string' ? datos.enlace.trim() : ''

  if (
    nombre.length < 1 || nombre.length > 100 ||
    descripcion.length < 1 || descripcion.length > 500 ||
    enlace.length < 1 || enlace.length > 2000
  ) {
    return { error: 'Revisá los datos del proyecto.' }
  }

  let url
  try {
    url = new URL(enlace)
  } catch {
    return { error: 'El enlace no es válido.' }
  }

  if (url.protocol !== 'https:') {
    return { error: 'El enlace debe comenzar con https://.' }
  }

  const imagen = imagePathFromName(nombre)
  if (!imagen) return { error: 'El nombre del proyecto no es válido.' }

  return { proyecto: { nombre, descripcion, enlace: url.href, imagen } }
}

// Editar un proyecto: solo el administrador autenticado.
export async function onRequestPut({ request, env, params }) {
  if (!isSameOrigin(request) || !(await verifySession(request, env))) {
    return Response.json({ error: 'No autorizado.' }, { status: 401, headers: NO_STORE })
  }

  const id = validarId(params.id)
  if (!id) {
    return Response.json({ error: 'ID inválido.' }, { status: 400, headers: NO_STORE })
  }

  try {
    const datos = await leerDatosProyecto(request)
    const validacion = validarProyecto(datos)

    if (validacion.error) {
      return Response.json({ error: validacion.error }, { status: 400, headers: NO_STORE })
    }

    const { nombre, descripcion, enlace, imagen } = validacion.proyecto
    const resultado = await env.DB
      .prepare(`
        UPDATE proyectos
        SET nombre = ?, descripcion = ?, imagen = ?, enlace = ?
        WHERE id = ?
      `)
      .bind(nombre, descripcion, imagen, enlace, id)
      .run()

    if (Number(resultado.meta?.changes || 0) === 0) {
      return Response.json({ error: 'No se encontró ese proyecto.' }, { status: 404, headers: NO_STORE })
    }

    return Response.json({ success: true }, { headers: NO_STORE })
  } catch (error) {
    if (error.message === 'FORMAT') return Response.json({ error: 'Formato de solicitud no válido.' }, { status: 415, headers: NO_STORE })
    if (error.message === 'TOO_LARGE') return Response.json({ error: 'La solicitud es demasiado grande.' }, { status: 413, headers: NO_STORE })
    if (error.message === 'INVALID') return Response.json({ error: 'El contenido enviado no es válido.' }, { status: 400, headers: NO_STORE })

    console.error('Error al editar proyecto:', error)
    return Response.json({ error: 'No se pudo editar el proyecto.' }, { status: 500, headers: NO_STORE })
  }
}

// Eliminar un proyecto: solo el administrador autenticado.
export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request) || !(await verifySession(request, env))) {
    return Response.json({ error: 'No autorizado.' }, { status: 401, headers: NO_STORE })
  }

  const id = validarId(params.id)
  if (!id) {
    return Response.json({ error: 'ID inválido.' }, { status: 400, headers: NO_STORE })
  }

  try {
    const resultado = await env.DB
      .prepare('DELETE FROM proyectos WHERE id = ?')
      .bind(id)
      .run()

    if (Number(resultado.meta?.changes || 0) === 0) {
      return Response.json({ error: 'No se encontró ese proyecto.' }, { status: 404, headers: NO_STORE })
    }

    return Response.json({ success: true }, { headers: NO_STORE })
  } catch (error) {
    console.error('Error al eliminar proyecto:', error)
    return Response.json({ error: 'No se pudo eliminar el proyecto.' }, { status: 500, headers: NO_STORE })
  }
}
