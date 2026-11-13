const encoder = new TextEncoder()

// Exige que las operaciones que modifican datos provengan del mismo sitio.
export function isSameOrigin(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return false

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

// Seudonimiza la IP con HMAC. La IP original nunca se almacena en D1.
async function hashClientIp(ip, secret) {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('SESSION_SECRET no está configurado.')
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(ip))
  )

  return Array.from(signature, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Límite de intentos persistente en D1, separado por acción y cliente.
export async function checkRateLimit(env, request, options) {
  const { scope, limit, windowSeconds } = options

  if (
    typeof scope !== 'string' ||
    !Number.isSafeInteger(limit) || limit < 1 ||
    !Number.isSafeInteger(windowSeconds) || windowSeconds < 1
  ) {
    throw new Error('Configuración de límite de intentos no válida.')
  }

  const now = Math.floor(Date.now() / 1000)
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const clientHash = await hashClientIp(ip, env.SESSION_SECRET)

  // Limpia registros vencidos para que la tabla no crezca indefinidamente.
  await env.DB
    .prepare('DELETE FROM api_rate_limits WHERE window_start < ?')
    .bind(now - 24 * 60 * 60)
    .run()

  const row = await env.DB
    .prepare(`
      INSERT INTO api_rate_limits (scope, client_hash, window_start, attempts)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(scope, client_hash, window_start)
      DO UPDATE SET attempts = attempts + 1
      RETURNING attempts
    `)
    .bind(scope, clientHash, windowStart)
    .first()

  const attempts = Number(row?.attempts || 0)
  const retryAfter = Math.max(1, windowStart + windowSeconds - now)

  return {
    allowed: attempts <= limit,
    attempts,
    retryAfter
  }
}

export function rateLimitResponse(retryAfter) {
  return Response.json(
    { error: 'Demasiados intentos. Esperá unos minutos y volvé a intentar.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'Cache-Control': 'no-store'
      }
    }
  )
}
