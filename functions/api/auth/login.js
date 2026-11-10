import {
  createSessionToken,
  sessionCookie
} from '../../_lib/auth.js'

export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json()

    if (
      typeof password !== 'string' ||
      password.length === 0 ||
      password.length > 200
    ) {
      return Response.json(
        { error: 'Datos inválidos.' },
        { status: 400 }
      )
    }

    if (password !== env.ADMIN_PASSWORD) {
      return Response.json(
        { error: 'Contraseña incorrecta.' },
        { status: 401 }
      )
    }

    const token = await createSessionToken(env)

    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': sessionCookie(token)
        }
      }
    )
  } catch {
    return Response.json(
      { error: 'No se pudo iniciar sesión.' },
      { status: 400 }
    )
  }
}
