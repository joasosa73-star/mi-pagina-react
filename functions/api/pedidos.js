import { verifySession } from '../_lib/auth.js'
import {
  checkRateLimit,
  isSameOrigin,
  rateLimitResponse
} from '../_lib/security.js'

const NO_STORE = { 'Cache-Control': 'no-store' }
const encoder = new TextEncoder()

// Consultar solicitudes: exclusivamente el administrador autenticado.
export async function onRequestGet({ request, env }) {
  if (!(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401, headers: NO_STORE }
    )
  }

  try {
    const resultado = await env.DB
      .prepare(`
        SELECT id, nombre, tipo_negocio, telefono, estado, creado_en
        FROM pedidos
        ORDER BY id DESC
      `)
      .all()

    return Response.json(resultado.results || [], { headers: NO_STORE })
  } catch (error) {
    console.error('Error al consultar pedidos:', error)
    return Response.json(
      { error: 'No se pudieron cargar los pedidos.' },
      { status: 500, headers: NO_STORE }
    )
  }
}

// Recibir una solicitud pública y guardarla en D1.
export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return Response.json(
      { error: 'Origen no permitido.' },
      { status: 403, headers: NO_STORE }
    )
  }

  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return Response.json(
      { error: 'Formato de solicitud no válido.' },
      { status: 415, headers: NO_STORE }
    )
  }

  try {
    const rate = await checkRateLimit(env, request, {
      scope: 'public-pedido',
      limit: 5,
      windowSeconds: 10 * 60
    })

    if (!rate.allowed) return rateLimitResponse(rate.retryAfter)

    const cuerpo = await request.text()
    if (encoder.encode(cuerpo).byteLength > 4096) {
      return Response.json(
        { error: 'La solicitud es demasiado grande.' },
        { status: 413, headers: NO_STORE }
      )
    }

    let datos
    try {
      datos = JSON.parse(cuerpo)
    } catch {
      return Response.json(
        { error: 'El contenido enviado no es válido.' },
        { status: 400, headers: NO_STORE }
      )
    }

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      return Response.json(
        { error: 'Datos inválidos.' },
        { status: 400, headers: NO_STORE }
      )
    }

    // Honeypot: bots simples completan este campo; no se guarda el pedido.
    if (typeof datos.website === 'string' && datos.website.trim() !== '') {
      return Response.json(
        { success: true },
        { status: 201, headers: NO_STORE }
      )
    }

    const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : ''
    const tipoNegocio = typeof datos.tipo_negocio === 'string'
      ? datos.tipo_negocio.trim()
      : ''
    const telefonoOriginal = typeof datos.telefono === 'string'
      ? datos.telefono.trim()
      : ''
    const telefono = telefonoOriginal.replace(/\D/g, '')

    if (
      nombre.length < 2 || nombre.length > 80 ||
      tipoNegocio.length < 2 || tipoNegocio.length > 100 ||
      telefonoOriginal.length > 25 ||
      telefono.length < 8 || telefono.length > 15
    ) {
      return Response.json(
        { error: 'Revisá el nombre, el negocio y el número de WhatsApp.' },
        { status: 400, headers: NO_STORE }
      )
    }

    const resultado = await env.DB
      .prepare(`
        INSERT INTO pedidos (nombre, tipo_negocio, telefono)
        VALUES (?, ?, ?)
      `)
      .bind(nombre, tipoNegocio, telefono)
      .run()

    return Response.json(
      { success: true, id: resultado.meta?.last_row_id ?? null },
      { status: 201, headers: NO_STORE }
    )
  } catch (error) {
    console.error('Error al registrar pedido:', error)
    return Response.json(
      { error: 'No se pudo registrar la solicitud. Probá nuevamente más tarde.' },
      { status: 503, headers: NO_STORE }
    )
  }
}

// Eliminar una solicitud: exclusivamente el administrador autenticado.
export async function onRequestDelete({ request, env }) {
  if (!isSameOrigin(request) || !(await verifySession(request, env))) {
    return Response.json(
      { error: 'No autorizado.' },
      { status: 401, headers: NO_STORE }
    )
  }

  try {
    const cuerpo = await request.text()
    if (encoder.encode(cuerpo).byteLength > 1024) {
      return Response.json(
        { error: 'La solicitud es demasiado grande.' },
        { status: 413, headers: NO_STORE }
      )
    }

    let datos
    try {
      datos = JSON.parse(cuerpo)
    } catch {
      return Response.json(
        { error: 'El contenido enviado no es válido.' },
        { status: 400, headers: NO_STORE }
      )
    }

    const id = Number(datos?.id)
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json(
        { error: 'El número del pedido no es válido.' },
        { status: 400, headers: NO_STORE }
      )
    }

    const resultado = await env.DB
      .prepare('DELETE FROM pedidos WHERE id = ?')
      .bind(id)
      .run()

    if (Number(resultado.meta?.changes || 0) === 0) {
      return Response.json(
        { error: 'El pedido no existe o ya fue eliminado.' },
        { status: 404, headers: NO_STORE }
      )
    }

    return Response.json({ success: true }, { headers: NO_STORE })
  } catch (error) {
    console.error('Error al eliminar pedido:', error)
    return Response.json(
      { error: 'No se pudo eliminar el pedido.' },
      { status: 500, headers: NO_STORE }
    )
  }
}
