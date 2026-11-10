import { verifySession } from '../_lib/auth.js'
import { imagePathFromName } from '../_lib/projects.js'

// Mostrar todos los proyectos.
export async function onRequestGet({ env }) {
  try {
    const resultado = await env.DB
      .prepare(`
        SELECT id, nombre, descripcion, imagen, enlace
        FROM proyectos
        ORDER BY id DESC
      `)
      .all()

    return Response.json(resultado.results || [], {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch {
    return Response.json(
      { error: 'No se pudieron cargar los proyectos.' },
      { status: 500 }
    )
  }
}

// Agregar un proyecto: solo para el administrador.
export async function onRequestPost({ request, env }) {
  if (!(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401 }
    )
  }

  try {
    const datos = await request.json()

    const nombre = typeof datos.nombre === 'string'
      ? datos.nombre.trim()
      : ''

    const descripcion = typeof datos.descripcion === 'string'
      ? datos.descripcion.trim()
      : ''

    const enlace = typeof datos.enlace === 'string'
      ? datos.enlace.trim()
      : ''

    if (
      !nombre || nombre.length > 100 ||
      !descripcion || descripcion.length > 500 ||
      !enlace || enlace.length > 2000
    ) {
      return Response.json(
        { error: 'Revisá los datos del proyecto.' },
        { status: 400 }
      )
    }

    let url

    try {
      url = new URL(enlace)
    } catch {
      return Response.json(
        { error: 'El enlace no es válido.' },
        { status: 400 }
      )
    }

    if (url.protocol !== 'https:') {
      return Response.json(
        { error: 'El enlace debe comenzar con https://.' },
        { status: 400 }
      )
    }

    const imagen = imagePathFromName(nombre)

    if (!imagen) {
      return Response.json(
        { error: 'El nombre del proyecto no es válido.' },
        { status: 400 }
      )
    }

    await env.DB
      .prepare(`
        INSERT INTO proyectos (nombre, descripcion, imagen, enlace)
        VALUES (?, ?, ?, ?)
      `)
      .bind(nombre, descripcion, imagen, url.href)
      .run()

    return Response.json(
      { success: true },
      { status: 201 }
    )
  } catch {
    return Response.json(
      { error: 'No se pudo agregar el proyecto.' },
      { status: 500 }
    )
  }
}
