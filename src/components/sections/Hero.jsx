
import '../../styles/sections/hero.css'

import {
  ArrowUpRight,
  Mail
} from 'lucide-react'

import { motion } from 'motion/react'

// Animación de entrada de la presentación
const presentacion = {
  oculto: {
    opacity: 0,
    y: 40
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15
    }
  }
}

// Animación individual de los elementos
const elemento = {
  oculto: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
}

// Animación de las tecnologías
const tecnologias = {
  oculto: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

function Hero() {
  return (
    <section className="hero" id="inicio">

      {/* FONDO DECORATIVO */}
      <div className="hero-fondo"></div>
      <div className="hero-cuadricula"></div>

      <div className="hero-contenedor">

        {/* PRESENTACIÓN */}
        <motion.div
          className="hero-contenido"
          variants={presentacion}
          initial="oculto"
          animate="visible"
        >

          <motion.span
            className="hero-etiqueta"
            variants={elemento}
          >
            <span className="hero-punto"></span>
            DESARROLLADOR WEB
          </motion.span>

          <motion.h1 variants={elemento}>
            Hola, soy
            <span> JOANET.</span>
            <br />
            Desarrollo
            <br />
            experiencias digitales.
          </motion.h1>

          <motion.p
            className="hero-descripcion"
            variants={elemento}
          >
            Creo páginas web modernas, funcionales y adaptables
            a cualquier dispositivo. Transformo ideas en experiencias
            digitales mediante diseño y desarrollo web.
          </motion.p>

          {/* BOTONES */}
          <motion.div
            className="hero-botones"
            variants={elemento}
          >

            <motion.a
              href="#proyectos"
              className="hero-btn principal"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              Ver proyectos
              <ArrowUpRight size={18} />
            </motion.a>

            <motion.a
              href="#contacto"
              className="hero-btn secundario"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              Contactarme
              <Mail size={18} />
            </motion.a>

          </motion.div>

          {/* TECNOLOGÍAS */}
          <motion.div
            className="hero-tecnologias"
            variants={elemento}
          >

            <span className="hero-tecnologias-titulo">
              TECNOLOGÍAS
            </span>

            <motion.div
              className="hero-lista-tecnologias"
              variants={tecnologias}
              initial="oculto"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >

              {['HTML', 'CSS', 'JAVASCRIPT', 'REACT'].map((tecnologia) => (
                <motion.span
                  key={tecnologia}
                  variants={elemento}
                  whileHover={{
                    scale: 1.15,
                    color: '#3478f6'
                  }}
                >
                  {tecnologia}
                </motion.span>
              ))}

            </motion.div>

          </motion.div>

        </motion.div>

        {/* PANEL VISUAL DE CÓDIGO */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >

          <div className="hero-circulo"></div>

          <motion.div
            className="hero-panel"
            whileHover={{
              y: -8,
              boxShadow: '0 25px 80px rgba(52, 120, 246, 0.2)'
            }}
            transition={{ duration: 0.3 }}
          >

            {/* CABECERA */}
            <div className="hero-panel-cabecera">

              <div className="hero-ventana">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span className="hero-panel-titulo">
                joanet.dev
              </span>

              <span className="hero-panel-icono">
                {'</>'}
              </span>

            </div>

            {/* CÓDIGO */}
            <div className="hero-codigo">

              <div className="codigo-linea">
                <span className="codigo-numero">01</span>
                <span className="codigo-azul">const</span>
                <span> desarrollador = {'{'}</span>
              </div>

              <div className="codigo-linea">
                <span className="codigo-numero">02</span>
                <span className="codigo-sangria">nombre:</span>
                <span className="codigo-blanco"> 'JOANET',</span>
              </div>

              <div className="codigo-linea">
                <span className="codigo-numero">03</span>
                <span className="codigo-sangria">especialidad:</span>
              </div>

              <div className="codigo-linea">
                <span className="codigo-numero">04</span>
                <span className="codigo-sangria codigo-blanco">
                  'Desarrollo web',
                </span>
              </div>

              <div className="codigo-linea">
                <span className="codigo-numero">05</span>
                <span className="codigo-sangria">tecnologias:</span>
              </div>

              <div className="codigo-linea">
                <span className="codigo-numero">06</span>
                <span className="codigo-sangria codigo-azul">
                  ['HTML', 'CSS', 'React']
                </span>
              </div>

              <div className="codigo-linea">
                <span className="codigo-numero">07</span>
                <span>{'}'}</span>
              </div>

              <div className="codigo-linea codigo-final">
                <span className="codigo-numero">08</span>
                <span className="codigo-azul">export default</span>
                <span> desarrollador;</span>
              </div>

            </div>

            {/* PIE DEL PANEL */}
            <div className="hero-panel-pie">

              <span>
                <span className="hero-punto"></span>
                Construyendo nuevas ideas
              </span>

              <span>JOANET</span>

            </div>

          </motion.div>

          {/* ETIQUETA FLOTANTE */}
          <motion.div
            className="hero-flotante"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >

            <span className="hero-flotante-icono">✳</span>

            <div>
              <strong>Creatividad + Código</strong>
              <small>Ideas hechas realidad</small>
            </div>

          </motion.div>

        </motion.div>

      </div>

      {/* INDICADOR INFERIOR */}
      <div className="hero-inferior">
        <span>PORTAFOLIO PERSONAL</span>
        <span>DESLIZÁ PARA DESCUBRIR <b>↓</b></span>
      </div>

    </section>
  )
}

export default Hero
