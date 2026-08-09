import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Main entry point: executing execution check.');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element with ID "root" was not found in the DOM.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('Main entry point: App successfully rendered.');
} catch (error) {
  console.error('Main entry point failure:', error);
}
