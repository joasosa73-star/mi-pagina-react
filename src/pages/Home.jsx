import { useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import Header from '../components/layout/Header.jsx'
import Hero from '../components/sections/Hero.jsx'
import Proyectos from '../components/sections/Proyectos.jsx'
import Footer from '../components/layout/Footer.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

export default function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenu = useRef(null)

  const cerrarMenu = () => setMenuAbierto(false)
  const alternarMenu = () => setMenuAbierto((estado) => !estado)

  const manejarTecla = (evento) => {
    if (evento.key === 'Escape') {
      cerrarMenu()
      botonMenu.current?.focus()
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <Header
          menuAbierto={menuAbierto}
          botonMenu={botonMenu}
          alternarMenu={alternarMenu}
          cerrarMenu={cerrarMenu}
          manejarTecla={manejarTecla}
        />
        <main>
          <Hero />
          <Proyectos />
        </main>
        <Footer />
      </MotionConfig>
    </QueryClientProvider>
  )
}
