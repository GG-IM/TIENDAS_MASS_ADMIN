// steps/Step3Confirmation.jsx
import React from 'react';
import { FaCheck } from "react-icons/fa";
import { formatCurrency } from '../utils/formatters';

const Step3Confirmation = ({ pedidoCreado }) => {
  const getPaymentStatusText = (estado) => {
    switch ((estado || '').toUpperCase()) {
      case 'COMPLETADO': return 'Completado';
      case 'PENDIENTE': return 'Pendiente';
      case 'PENDIENTE_VERIFICACION': return 'Pendiente de Verificación';
      case 'FALLIDO': return 'Fallido';
      default: return estado || 'Pendiente';
    }
  };

  const getPaymentStatusColor = (estado) => {
    switch ((estado || '').toUpperCase()) {
      case 'COMPLETADO': return 'green';
      case 'PENDIENTE':
      case 'PENDIENTE_VERIFICACION': return 'orange';
      case 'FALLIDO': return 'red';
      default: return 'orange';
    }
  };

  if (!pedidoCreado) {
    return <div className="loading">Cargando confirmación...</div>;
  }

  return (
    <div className="section-box confirmation-section">
      <div className="confirmation-content">
        <div className="confirmation-icon"><FaCheck /></div>
        <h2>¡Pedido Confirmado!</h2>
        <p>Gracias por tu compra. Tu pedido ha sido procesado exitosamente.</p>

        <div className="order-details">
          <h3>Detalles del Pedido</h3>
          <div className="detail-row">
            <span>Número de Pedido:</span>
            <strong>#{pedidoCreado.id}</strong>
          </div>
          <div className="detail-row">
            <span>Método de Pago:</span>
            <strong>{pedidoCreado.metodoPago?.nombre || 'N/A'}</strong>
          </div>
          <div className="detail-row">
            <span>Estado del Pago:</span>
            <strong style={{ color: getPaymentStatusColor(pedidoCreado.estadoPago) }}>
              {getPaymentStatusText(pedidoCreado.estadoPago)}
            </strong>
          </div>
          <div className="detail-row">
            <span>Estado del Pedido:</span>
            <strong>{pedidoCreado.estado}</strong>
          </div>
          <div className="detail-row">
            <span>Dirección de Entrega:</span>
            <strong>{pedidoCreado.direccionEnvio}</strong>
          </div>
        </div>

        <div className="order-products">
          <h3>Productos Pedidos</h3>
          {(pedidoCreado.detallesPedidos || []).map((item, index) => (
            <div key={index} className="order-product-item">
              <span>{item.nombre || item.producto?.nombre || 'Producto sin nombre'}</span>
              <span>x{item.cantidad}</span>
              <span>{formatCurrency((item.precio || 0) * item.cantidad)}</span>
            </div>
          ))}
          <div className="order-total">
            <span>Total:</span>
            <strong>{formatCurrency(pedidoCreado.montoTotal || 0)}</strong>
          </div>
        </div>

        <button className="btn-primary" onClick={() => { window.location.href = '/'; }}>
          Continuar Comprando
        </button>
      </div>
    </div>
  );
};

export default Step3Confirmation;