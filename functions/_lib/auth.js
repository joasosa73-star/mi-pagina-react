const encoder = new TextEncoder()

// Convierte datos a Base64 URL seguro.
function base64urlEncode(bytes) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Convierte Base64 URL a datos.
function base64urlDecode(value) {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)

  const binary = atob(padded)

  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

// Prepara la clave para firmar las sesiones.
async function getSigningKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign', 'verify']
  )
}

// Crea una sesión válida durante 8 horas.
export async function createSessionToken(env) {
  const expiration = Math.floor(Date.now() / 1000) + 8 * 60 * 60

  const payload = base64urlEncode(
    encoder.encode(JSON.stringify({ expiration }))
  )

  const key = await getSigningKey(env.SESSION_SECRET)

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )

  return `${payload}.${base64urlEncode(new Uint8Array(signature))}`
}

// Comprueba si la sesión es válida.
export async function verifySession(request, env) {
  try {
    const cookie = request.headers.get('Cookie') || ''

    const match = cookie.match(/(?:^|;\s*)joanet_session=([^;]+)/)

    if (!match) return false

    const parts = match[1].split('.')

    if (parts.length !== 2) return false

    const [payload, signature] = parts

    const key = await getSigningKey(env.SESSION_SECRET)

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecode(signature),
      encoder.encode(payload)
    )

    if (!valid) return false

    const data = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payload))
    )

    return data.expiration > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

// Cookie privada del administrador.
export function sessionCookie(token) {
  return `joanet_session=${token}; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Strict`
}

// Elimina la sesión.
export function clearSessionCookie() {
  return 'joanet_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict'
}
