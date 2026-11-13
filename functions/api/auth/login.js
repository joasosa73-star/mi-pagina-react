import {
  createSessionToken,
  sessionCookie
} from '../../_lib/auth.js'
import {
  checkRateLimit,
  isSameOrigin,
  rateLimitResponse
} from '../../_lib/security.js'

const NO_STORE = { 'Cache-Control': 'no-store' }
const encoder = new TextEncoder()

function compararEnTiempoConstante(valor, esperado) {
  const izquierda = encoder.encode(valor)
  const derecha = encoder.encode(esperado)
  const longitud = Math.max(izquierda.length, derecha.length)
  let diferencia = izquierda.length ^ derecha.length

  for (let indice = 0; indice < longitud; indice += 1) {
    diferencia |= (izquierda[indice] || 0) ^ (derecha[indice] || 0)
  }

  return diferencia === 0
}

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
      scope: 'admin-login',
      limit: 8,
      windowSeconds: 15 * 60
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

    const password = datos?.password
    if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
      return Response.json(
        { error: 'Datos inválidos.' },
        { status: 400, headers: NO_STORE }
      )
    }

    if (typeof env.ADMIN_PASSWORD !== 'string' || env.ADMIN_PASSWORD.length === 0) {
      throw new Error('ADMIN_PASSWORD no está configurado.')
    }

    if (!compararEnTiempoConstante(password, env.ADMIN_PASSWORD)) {
      return Response.json(
        { error: 'Contraseña incorrecta.' },
        { status: 401, headers: NO_STORE }
      )
    }

    const token = await createSessionToken(env)

    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': sessionCookie(token),
          ...NO_STORE
        }
      }
    )
  } catch (error) {
    console.error('Error en inicio de sesión:', error)
    return Response.json(
      { error: 'No se pudo iniciar sesión. Revisá la configuración del servidor.' },
      { status: 503, headers: NO_STORE }
    )
  }
}
