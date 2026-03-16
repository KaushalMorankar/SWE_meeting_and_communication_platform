import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
