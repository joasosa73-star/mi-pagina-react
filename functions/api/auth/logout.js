import { clearSessionCookie } from '../../_lib/auth.js'

export async function onRequestPost() {
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
