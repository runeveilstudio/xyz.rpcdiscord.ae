import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function mountApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}
