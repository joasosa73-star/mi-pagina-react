const HEADERS_SEGURIDAD = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'; upgrade-insecure-requests"
}

export async function onRequest(context) {
  const response = await context.next()
  const headers = new Headers(response.headers)
  const url = new URL(context.request.url)
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  for (const [name, value] of Object.entries(HEADERS_SEGURIDAD)) {
    headers.set(name, value)
  }

  // HSTS solo se envía por HTTPS. No se fija para el servidor local HTTP.
  if (url.protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // No almacenar respuestas de API ni documentos HTML de la SPA.
  // Los archivos versionados /assets/* conservan su caché larga definida en _headers.
  if (pathname.startsWith('/api/')) {
    headers.set('Cache-Control', 'no-store')
  } else if (
    pathname === '/' ||
    pathname === '/admin' ||
    pathname === '/pedido' ||
    pathname.endsWith('.html')
  ) {
    headers.set('Cache-Control', 'no-cache')
  }

  // Evita que los buscadores indexen el área privada y las respuestas de API.
  if (pathname === '/admin' || pathname.startsWith('/api/')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
