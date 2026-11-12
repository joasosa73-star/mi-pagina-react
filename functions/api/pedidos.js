
import { verifySession } from '../_lib/auth.js'

// ========================================
// CONSULTAR PEDIDOS
// Solo el administrador puede verlos.
// ========================================

export async function onRequestGet({ request, env }) {
  if (!(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401 }
    )
  }

  try {
    const resultado = await env.DB
      .prepare(`
        SELECT
          id,
          nombre,
          tipo_negocio,
          telefono,
          estado,
          creado_en
        FROM pedidos
        ORDER BY id DESC
      `)
      .all()

    return Response.json(resultado.results || [], {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error al consultar pedidos:', error)

    return Response.json(
      { error: 'No se pudieron cargar los pedidos.' },
      { status: 500 }
    )
  }
}

// ========================================
// RECIBIR UNA NUEVA SOLICITUD
// Este endpoint es público.
// ========================================

export async function onRequestPost({ request, env }) {
  try {
    // Aceptar únicamente solicitudes JSON.
    const contentType = request.headers.get('Content-Type') || ''

    if (!contentType.toLowerCase().includes('application/json')) {
      return Response.json(
        { error: 'Formato de solicitud no válido.' },
        { status: 415 }
      )
    }

    // Evitar solicitudes desde otros orígenes.
    const origen = request.headers.get('Origin')

    if (origen && origen !== new URL(request.url).origin) {
      return Response.json(
        { error: 'Origen no permitido.' },
        { status: 403 }
      )
    }

    const datos = await request.json()

    const nombre = typeof datos.nombre === 'string'
      ? datos.nombre.trim()
      : ''

    const tipoNegocio = typeof datos.tipo_negocio === 'string'
      ? datos.tipo_negocio.trim()
      : ''

    const telefonoOriginal = typeof datos.telefono === 'string'
      ? datos.telefono.trim()
      : ''

    // Guardar el teléfono solamente con números.
    const telefono = telefonoOriginal.replace(/\D/g, '')

    // Validar los datos recibidos.
    if (
      nombre.length < 2 ||
      nombre.length > 80 ||
      tipoNegocio.length < 2 ||
      tipoNegocio.length > 100 ||
      telefonoOriginal.length > 25 ||
      telefono.length < 8 ||
      telefono.length > 15
    ) {
      return Response.json(
        { error: 'Revisá el nombre, el negocio y el número de WhatsApp.' },
        { status: 400 }
      )
    }

    // Guardar el pedido en Cloudflare D1.
    const resultado = await env.DB
      .prepare(`
        INSERT INTO pedidos (
          nombre,
          tipo_negocio,
          telefono
        )
        VALUES (?, ?, ?)
      `)
      .bind(nombre, tipoNegocio, telefono)
      .run()

    return Response.json(
      {
        success: true,
        id: resultado.meta?.last_row_id
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Error al guardar pedido:', error)

    return Response.json(
      { error: 'No se pudo registrar la solicitud.' },
      { status: 500 }
    )
  }
}

// ========================================
// ELIMINAR UN PEDIDO
// Solo el administrador puede hacerlo.
// ========================================

export async function onRequestDelete({ request, env }) {
  if (!(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401 }
    )
  }

  try {
    const datos = await request.json()
    const id = Number(datos.id)

    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json(
        { error: 'El número del pedido no es válido.' },
        { status: 400 }
      )
    }

    const resultado = await env.DB
      .prepare('DELETE FROM pedidos WHERE id = ?')
      .bind(id)
      .run()

    if (resultado.meta?.changes === 0) {
      return Response.json(
        { error: 'El pedido no existe o ya fue eliminado.' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      message: 'Pedido eliminado correctamente.'
    })
  } catch (error) {
    console.error('Error al eliminar pedido:', error)

    return Response.json(
      { error: 'No se pudo eliminar el pedido.' },
      { status: 500 }
    )
  }
}
