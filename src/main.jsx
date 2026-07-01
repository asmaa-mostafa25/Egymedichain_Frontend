import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Runtime error:', event.error || event.message);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
