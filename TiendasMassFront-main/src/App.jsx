// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Categorias from './pages/categorias';
import CheckoutPage from './pages/CheckoutPage';
import Contacto from './pages/Contacto';
import { CarritoProvider } from './context/carContext';
import { UsuarioProvider } from './context/userContext';
import ResultadosBusqueda from './pages/ResultadosBusqueda';
import UserProfile from './pages/perfil';
import DetalleProducto from './components/productos/detalleproductomodal';
import Admin from './pages/admin';
import Dashboard from './admin/components/Dashboard';
import GestionCategorias from './admin/components/GestionCategorias';
import GestionEstados from './admin/components/GestionEstados';
import GestionMetodoPago from './admin/components/GestionMetodoPago';
import GestionProducto from './admin/components/GestionProducto';
import GestionUsuarios from './admin/components/GestionUsuarios';
import ReportesPedidos from './admin/components/ReportesPedidos';
import CrearAdmin from './admin/components/CrearAdmin';
import AdminRoute from './components/AdminRoute';
import GestionTienda from './admin/components/GestionTienda';

import { initMercadoPago } from '@mercadopago/sdk-react';

// 🔥 Nueva página de éxito
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutFailure from './pages/CheckoutFailure';
import CheckoutPending from './pages/CheckoutPending';

// 🆕 Componentes de accesibilidad
import SkipLinks from './components/SkipLinks';

function App() {
  useEffect(() => {
    // Inicializa Mercado Pago con tu public key del .env de Vite
    initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-PE' });
  }, []);

  return (
    <UsuarioProvider>
      <CarritoProvider>
        <SkipLinks />
        <Router>
          <Routes>
            {/* Rutas Admin */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="categorias" element={<GestionCategorias />} />
              <Route path="estados" element={<GestionEstados />} />
              <Route path="metodos-pago" element={<GestionMetodoPago />} />
              <Route path="productos" element={<GestionProducto />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="reportes" element={<ReportesPedidos />} />
              <Route path="crear-admin" element={<CrearAdmin />} />
              <Route path="tiendas" element={<GestionTienda />} />
            </Route>

            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/producto/:id" element={<DetalleProducto />} />
            <Route path="/buscar" element={<ResultadosBusqueda />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="/contacto" element={<Contacto />} />

            {/* ✅ Ruta para el éxito de Mercado Pago */}
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            {/* ❌ Ruta para el fallo de Mercado Pago */}
            <Route path="/checkout/failure" element={<CheckoutFailure />} />
            {/* ⏳ Ruta para pagos pendientes */}
            <Route path="/checkout/pending" element={<CheckoutPending />} />
          </Routes>
        </Router>
      </CarritoProvider>
    </UsuarioProvider>
  );
}

export default App;
