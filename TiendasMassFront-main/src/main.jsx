// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-PE' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
