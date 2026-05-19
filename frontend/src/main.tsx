import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Only register the generated service worker in production.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (!import.meta.env.PROD) {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        await registration.unregister();
      }
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (err) {
      console.log('SW registration failed: ', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
