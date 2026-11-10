import { verifySession } from '../../_lib/auth.js'
import { imagePathFromName } from '../../_lib/projects.js'

// Editar un proyecto.
export async function onRequestPut({ request, env, params }) {
  if (!(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401 }
    )
  }

  const id = Number(params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return Response.json(
      { error: 'ID inválido.' },
      { status: 400 }
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

    const resultado = await env.DB
      .prepare(`
        UPDATE proyectos
        SET nombre = ?, descripcion = ?, imagen = ?, enlace = ?
        WHERE id = ?
      `)
      .bind(nombre, descripcion, imagen, url.href, id)
      .run()

    if (resultado.meta.changes === 0) {
      return Response.json(
        { error: 'No se encontró ese proyecto.' },
        { status: 404 }
      )
    }

    return Response.json({ success: true })
  } catch {
    return Response.json(
      { error: 'No se pudo editar el proyecto.' },
      { status: 500 }
    )
  }
}

// Eliminar un proyecto.
export async function onRequestDelete({ request, env, params }) {
  if (!(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401 }
    )
  }

  const id = Number(params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return Response.json(
      { error: 'ID inválido.' },
      { status: 400 }
    )
  }

  try {
    const resultado = await env.DB
      .prepare('DELETE FROM proyectos WHERE id = ?')
      .bind(id)
      .run()

    if (resultado.meta.changes === 0) {
      return Response.json(
        { error: 'No se encontró ese proyecto.' },
        { status: 404 }
      )
    }

    return Response.json({ success: true })
  } catch {
    return Response.json(
      { error: 'No se pudo eliminar el proyecto.' },
      { status: 500 }
    )
  }
}
