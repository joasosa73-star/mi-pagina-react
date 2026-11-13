# JOANET — Portafolio y solicitudes web

Proyecto React + Vite desplegado en Cloudflare Pages. Incluye el portafolio público, un formulario independiente para solicitar páginas web y un panel privado para administrar proyectos y pedidos.

## Estructura del proyecto

```text
functions/                       # Cloudflare Pages Functions (no mover)
  _lib/                           # Autenticación, validación y seguridad
  _middleware.js                  # Cabeceras de seguridad y caché por ruta
  api/                            # Endpoints /api/*
migrations/                       # Migraciones de Cloudflare D1
public/                           # Imágenes, icono, sitemap y cabeceras estáticas
src/
  components/
    layout/                       # Encabezado y pie
    sections/                     # Hero y carrusel de proyectos
  pages/                          # Inicio, administrador y pedido
  styles/
    layout/
    pages/
    sections/
    global.css
```

Las carpetas `functions/` y `migrations/` permanecen en la raíz porque Cloudflare Pages las necesita en esas ubicaciones.

## Requisitos e instalación

Usar Node.js `20.19+` o `22.12+`.

```bash
npm install
npm run build
npm run lint
```

`npm install` crea un `package-lock.json` nuevo para esta versión. El ZIP no contiene un lockfile viejo ni `node_modules`.

Para abrir la interfaz de Vite:

```bash
npm run dev
```

El servidor Vite por sí solo no ejecuta Pages Functions ni conecta D1. Para probar `/api/*`, sesiones y pedidos hay que usar un despliegue Preview de Cloudflare o un entorno local compatible con Wrangler/Workerd.

## Librerías

- `motion`: animaciones y respeto por la preferencia de movimiento reducido.
- `lucide-react`: iconos.
- `sonner`: notificaciones.
- `react-hook-form`, `zod`, `@hookform/resolvers`: formulario y validaciones de pedidos.
- `@tanstack/react-query`: caché en memoria para la consulta pública de proyectos.

El carrusel mantiene su animación CSS; no se añade Embla para evitar una dependencia que no aporta una mejora necesaria al comportamiento existente.

## Rutas

- `/` — portafolio.
- `/pedido` — formulario público para solicitar una página web.
- `/admin` — panel privado para administrar proyectos y pedidos.
- `/api/proyectos` — listado público; crear/editar/eliminar requiere sesión.
- `/api/pedidos` — `POST` público protegido con validación, honeypot y límite de intentos; `GET` y `DELETE` requieren sesión.

## Cloudflare Pages y D1

El binding de D1 debe llamarse `DB`.

- Preview: `joanet-proyectos-prueba`.
- Production: `joanet-proyectos`.

En Cloudflare Pages, configurá en **Preview** y **Production** los secrets `ADMIN_PASSWORD` y `SESSION_SECRET`. No los guardes en Git ni dentro del ZIP.

`SESSION_SECRET` debe ser un valor aleatorio largo. Podés generarlo en tu equipo con:

```bash
openssl rand -base64 48
```

Para el desarrollo local, copiá `dev.vars.example` como `.dev.vars` y reemplazá los valores. `.dev.vars` está ignorado por Git y no se incluye en este paquete.

### Migraciones D1

Esta versión incluye la migración `0004_create_api_rate_limits.sql`, necesaria para el límite de intentos. Las migraciones anteriores `0001`, `0002` y `0003` crean/importan proyectos y pedidos.

Revisá primero qué migraciones faltan y verificá el nombre de la base antes de aplicar.

**Preview:**

```bash
npx wrangler d1 migrations list joanet-proyectos-prueba --remote --env preview
npx wrangler d1 migrations apply joanet-proyectos-prueba --remote --env preview
```

**Production:**

```bash
npx wrangler d1 migrations list joanet-proyectos --remote --env production
npx wrangler d1 migrations apply joanet-proyectos --remote --env production
```

Si `0001`, `0002` y `0003` ya están aplicadas, Wrangler ejecutará solamente la `0004` pendiente. No uses `--remote` para pruebas que deban modificar datos locales.

## Seguridad incluida

- Sesiones HMAC firmadas en el servidor; cookie `HttpOnly`, `Secure` y `SameSite=Strict`.
- Protección de operaciones administrativas con sesión y verificación de origen.
- Límite de intentos por acción y cliente: login (8 intentos por 15 minutos) y pedidos públicos (5 por 10 minutos).
- La IP se seudonimiza mediante HMAC antes de persistirse en D1; no se guarda la IP en claro.
- Campo honeypot para filtrar bots simples del formulario.
- Validación en el navegador y nuevamente en la API, límite de tamaño de cuerpo y consultas D1 parametrizadas.
- Cabeceras CSP, HSTS (HTTPS), `X-Frame-Options`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- `/admin` y `/api/` se marcan como no indexables.

La protección anti-spam incluida reduce abuso básico, pero no sustituye Cloudflare Turnstile ni una regla WAF/rate limiting perimetral. Para un formulario público promocionado ampliamente, conviene añadir Turnstile.

## Rendimiento

- Las páginas Inicio, Administrador y Pedido se cargan mediante `lazy`/`Suspense`.
- Las imágenes de proyectos y del administrador usan carga diferida y decodificación asíncrona.
- TanStack Query conserva en memoria los proyectos públicos durante un minuto para evitar consultas repetidas.
- Los archivos versionados de `/assets/*` tienen caché larga e inmutable; las imágenes mantienen caché por una semana; los documentos HTML revalidan.
- Motion respeta la preferencia de movimiento reducido del sistema.

## Importante para compartir el proyecto

No incluyas `.git/`, `node_modules/`, `dist/`, `.wrangler/`, `.dev.vars` ni archivos `.env` con secretos al compartirlo. Este ZIP ya omite esos elementos.

Si tu instalación de Huayra muestra errores `GLIBC_* not found` al iniciar Wrangler local, no actualices glibc manualmente. Usá el Preview de Cloudflare para probar Pages Functions y D1.
