import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import '../styles/pages/pedido.css'

const esquemaPedido = z.object({
  nombre: z.string()
    .trim()
    .min(2, 'Ingresá tu nombre (mínimo 2 caracteres).')
    .max(80, 'El nombre es demasiado largo.'),
  tipo_negocio: z.string()
    .trim()
    .min(2, 'Contanos qué tipo de negocio tenés.')
    .max(100, 'La descripción del negocio es demasiado larga.'),
  telefono: z.string()
    .trim()
    .min(8, 'Ingresá un número de WhatsApp válido.')
    .max(25, 'El número es demasiado largo.')
    .refine((numero) => {
      const digitos = numero.replace(/\D/g, '')
      return digitos.length >= 8 && digitos.length <= 15
    }, 'El número debe tener entre 8 y 15 dígitos.'),
  // Campo trampa anti-spam. Los usuarios reales no deben completarlo.
  website: z.string().max(0, 'Solicitud no válida.').optional()
})

export default function Pedido() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(esquemaPedido),
    defaultValues: {
      nombre: '',
      tipo_negocio: '',
      telefono: '',
      website: ''
    }
  })

  async function enviarPedido(datos) {
    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(datos)
      })

      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.error || 'No se pudo enviar tu solicitud.')
      }

      reset()
      toast.success('¡Solicitud enviada!', {
        description: resultado.id
          ? `Tu número de solicitud es #${resultado.id}. Nos comunicaremos con vos.`
          : 'Recibimos tus datos. Nos comunicaremos con vos.'
      })
    } catch (error) {
      toast.error('No se pudo enviar la solicitud', {
        description: error.message
      })
    }
  }

  return (
    <main className="pedido-pagina">
      <header className="pedido-barra">
        <a href="/" className="pedido-logo">JOANET<span>.</span></a>
        <a href="/" className="pedido-volver">← Volver al sitio</a>
      </header>

      <section className="pedido-contenedor">
        <div className="pedido-introduccion">
          <span className="pedido-etiqueta">TRABAJEMOS JUNTOS</span>
          <h1>Tu negocio merece<br />una página <span>web.</span></h1>
          <p>
            Contame sobre tu negocio. Completá el formulario y me pondré
            en contacto con vos para conversar sobre tu página web.
          </p>
          <div className="pedido-detalle">
            <span className="pedido-punto" />
            SOLICITUD DIRECTA Y PERSONALIZADA
          </div>
        </div>

        <div className="pedido-tarjeta">
          <div className="pedido-tarjeta-encabezado">
            <div>
              <span className="pedido-numero">01 / SOLICITUD</span>
              <h2>Contame tu idea<span>.</span></h2>
            </div>
          </div>

          <form
            className="pedido-formulario"
            onSubmit={handleSubmit(enviarPedido)}
            noValidate
          >
            <div className="pedido-campo">
              <label htmlFor="pedido-nombre">Nombre completo</label>
              <input
                id="pedido-nombre"
                type="text"
                placeholder="Ej.: Juan Pérez"
                autoComplete="name"
                maxLength={80}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'error-nombre' : undefined}
                {...register('nombre')}
              />
              {errors.nombre && <span id="error-nombre" className="pedido-error">{errors.nombre.message}</span>}
            </div>

            <div className="pedido-campo">
              <label htmlFor="pedido-negocio">¿Qué tipo de negocio tenés?</label>
              <input
                id="pedido-negocio"
                type="text"
                placeholder="Ej.: Barbería, restaurante, tienda..."
                maxLength={100}
                aria-invalid={Boolean(errors.tipo_negocio)}
                aria-describedby={errors.tipo_negocio ? 'error-negocio' : undefined}
                {...register('tipo_negocio')}
              />
              {errors.tipo_negocio && <span id="error-negocio" className="pedido-error">{errors.tipo_negocio.message}</span>}
            </div>

            <div className="pedido-campo">
              <label htmlFor="pedido-telefono">Número de WhatsApp</label>
              <input
                id="pedido-telefono"
                type="tel"
                placeholder="Ej.: +54 9 3456 123456"
                autoComplete="tel"
                inputMode="tel"
                maxLength={25}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={errors.telefono ? 'error-telefono' : 'ayuda-telefono'}
                {...register('telefono')}
              />
              <span id="ayuda-telefono" className="pedido-ayuda">Incluí el código de país y de área.</span>
              {errors.telefono && <span id="error-telefono" className="pedido-error">{errors.telefono.message}</span>}
            </div>

            {/* Honeypot: oculto visualmente, pero accesible al servidor. */}
            <div className="pedido-campo pedido-campo-trampa" aria-hidden="true">
              <label htmlFor="pedido-website">Dejá este campo vacío</label>
              <input
                id="pedido-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register('website')}
              />
            </div>

            <button type="submit" className="pedido-enviar" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud'}</span>
              <span aria-hidden="true">↗</span>
            </button>

            <p className="pedido-privacidad">
              Tus datos se utilizarán únicamente para contactarte por tu solicitud.
            </p>
          </form>
        </div>
      </section>

      <footer className="pedido-footer">
        <span>JOANET<span>.</span></span>
        <p>Desarrollo web y experiencias digitales.</p>
      </footer>
    </main>
  )
}
