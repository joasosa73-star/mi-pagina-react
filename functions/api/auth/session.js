import { verifySession } from '../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const autenticado = await verifySession(request, env)

  return Response.json(
    { autenticado },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}
