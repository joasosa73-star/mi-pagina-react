
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import 'sonner/dist/styles.css'
import './styles/global.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      theme="dark"
      closeButton
      duration={3500}
      richColors
      toastOptions={{
        style: {
          background: '#05070C',
          color: '#FFFFFF',
          border: '1px solid #3478F6'
        }
      }}
    />
  </StrictMode>
)
