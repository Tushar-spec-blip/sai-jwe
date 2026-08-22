import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { MetalRatesProvider } from './context/MetalRatesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <MetalRatesProvider>
        <App />
      </MetalRatesProvider>
    </SettingsProvider>
  </StrictMode>,
)
