import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { IndexedDBStorage } from './services/indexedDb'

// Initialize IndexedDB defaults in background
IndexedDBStorage.initDefaults().catch(err => {
  console.warn('IndexedDB initial load error:', err);
});

// Register Service Worker for PWA offline shell support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
