import { verifySession } from '../_lib/auth.js'
import { imagePathFromName } from '../_lib/projects.js'
import { isSameOrigin } from '../_lib/security.js'

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

// Mostrar todos los proyectos. Esta información es pública.
export async function onRequestGet({ env }) {
  try {
    const resultado = await env.DB
      .prepare(`
        SELECT id, nombre, descripcion, imagen, enlace
        FROM proyectos
        ORDER BY id DESC
      `)
      .all()

    return Response.json(resultado.results || [], { headers: NO_STORE })
  } catch (error) {
    console.error('Error al cargar proyectos:', error)
    return Response.json(
      { error: 'No se pudieron cargar los proyectos.' },
      { status: 500, headers: NO_STORE }
    )
  }
}

// Agregar un proyecto: solo para el administrador autenticado.
export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request) || !(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401, headers: NO_STORE }
    )
  }

  try {
    const datos = await leerDatosProyecto(request)
    const validacion = validarProyecto(datos)

    if (validacion.error) {
      return Response.json(
        { error: validacion.error },
        { status: 400, headers: NO_STORE }
      )
    }

    const { nombre, descripcion, enlace, imagen } = validacion.proyecto
    await env.DB
      .prepare(`
        INSERT INTO proyectos (nombre, descripcion, imagen, enlace)
        VALUES (?, ?, ?, ?)
      `)
      .bind(nombre, descripcion, imagen, enlace)
      .run()

    return Response.json(
      { success: true },
      { status: 201, headers: NO_STORE }
    )
  } catch (error) {
    if (error.message === 'FORMAT') {
      return Response.json({ error: 'Formato de solicitud no válido.' }, { status: 415, headers: NO_STORE })
    }
    if (error.message === 'TOO_LARGE') {
      return Response.json({ error: 'La solicitud es demasiado grande.' }, { status: 413, headers: NO_STORE })
    }
    if (error.message === 'INVALID') {
      return Response.json({ error: 'El contenido enviado no es válido.' }, { status: 400, headers: NO_STORE })
    }

    console.error('Error al agregar proyecto:', error)
    return Response.json(
      { error: 'No se pudo agregar el proyecto.' },
      { status: 500, headers: NO_STORE }
    )
  }
}
