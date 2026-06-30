import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useSettingsStore } from './stores/settingsStore.ts'

// Apply the persisted dark-mode preference before first paint.
document.documentElement.classList.toggle('dark', useSettingsStore.getState().darkMode)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
