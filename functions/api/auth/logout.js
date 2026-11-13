import { clearSessionCookie } from '../../_lib/auth.js'
import { isSameOrigin } from '../../_lib/security.js'

export async function onRequestPost({ request }) {
  if (!isSameOrigin(request)) {
    return Response.json(
      { error: 'Origen no permitido.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return Response.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(),
        'Cache-Control': 'no-store'
      }
    }
  )
}
