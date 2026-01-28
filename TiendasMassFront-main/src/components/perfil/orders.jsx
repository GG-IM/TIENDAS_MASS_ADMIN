import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../context/userContext';
import '../../styles/perfil.css';
const API_URL = "http://localhost:5001";

const Orders = () => {
  const { usuario } = useUsuario();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!usuario?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/pedidos/usuario/${usuario.id}`);

        const data = await res.json();
        console.log('Respuesta del backend:', data);

        const pedidosFormateados = (data.pedidos || []).map(p => {
          // Obtener tipo de envío
          const tipoEnvio = p.shippingMethod 
            ? p.shippingMethod.nombre 
            : 'Recojo en tienda';
          
          // Obtener dirección o sede
          let direccionSede = 'N/A';
          if (p.direccion) {
            // Si hay una dirección guardada, formatearla
            direccionSede = `${p.direccion.nombre || ''} - ${p.direccion.calle}, ${p.direccion.ciudad} ${p.direccion.codigoPostal || ''}`.trim();
          } else if (p.direccionEnvio) {
            // Si hay dirección de envío como texto
            direccionSede = p.direccionEnvio;
          }

          return {
            id: p.id,
            fecha: p.fechaPedido,
            items: p.detallesPedidos || [],
            total: parseFloat(p.montoTotal),
            status: p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
            tipoEnvio: tipoEnvio,
            direccionSede: direccionSede,
          };
        });

        setOrders(pedidosFormateados);
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [usuario]);

  const totalGastado = orders.reduce((acc, o) => acc + parseFloat(o.total), 0).toFixed(2);
  const pedidosEnProceso = orders.filter(o => o.status === 'En Proceso').length;

  return (
    <div className="orders-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Mis Pedidos</h2>
          <p>Historial de todas tus compras</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total Pedidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">S/ {totalGastado}</div>
          <div className="stat-label">Gastado Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pedidosEnProceso}</div>
          <div className="stat-label">En Proceso</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>No tienes pedidos aún.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-main">
                <div className="order-info">
                  <div className="order-id">Pedido #{order.id}</div>
                  <div className="order-date">{new Date(order.fecha).toLocaleDateString()}</div>
                  <div className="order-items">
                    <div>{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</div>
                    {order.items.length > 0 && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.875rem',
                          padding: 0,
                          marginTop: '0.25rem'
                        }}
                      >
                        ver más...
                      </button>
                    )}
                  </div>
                </div>
                <div className="order-status-section">
                  <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                    {order.status}
                  </span>
                  <div className="order-total">S/ {parseFloat(order.total).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalles de Productos */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg" style={{ marginTop: '5vh' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Pedido #{selectedOrder.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Fecha del Pedido:</strong> {new Date(selectedOrder.fecha).toLocaleDateString()}</p>
                    <p><strong>Tipo de envío:</strong> {selectedOrder.tipoEnvio}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Estado:</strong> 
                      <span className={`order-status status-${selectedOrder.status.toLowerCase().replace(/\s/g, '-')}`} style={{ marginLeft: '0.5rem' }}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><strong>Total:</strong> <span style={{ fontWeight: 'bold', color: '#1e293b' }}>S/ {parseFloat(selectedOrder.total).toFixed(2)}</span></p>
                  </div>
                </div>
                <div className="mb-3">
                  <p><strong>Dirección/Sede:</strong> {selectedOrder.direccionSede}</p>
                </div>
                
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-4">
                    <h6>Productos del Pedido</h6>
                    <div className="table-responsive">
                      <table className="table table-sm" style={{ marginTop: '1rem' }}>
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((detalle, index) => (
                            <tr key={index}>
                              <td>{detalle.producto?.nombre || 'N/A'}</td>
                              <td>{detalle.cantidad}</td>
                              <td>S/.{parseFloat(detalle.precio || 0).toFixed(2)}</td>
                              <td>S/.{((detalle.cantidad || 0) * parseFloat(detalle.precio || 0)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          {(() => {
                            // Calcular subtotal de productos
                            const subtotalProductos = selectedOrder.items.reduce((sum, detalle) => {
                              return sum + ((detalle.cantidad || 0) * parseFloat(detalle.precio || 0));
                            }, 0);
                            
                            // Calcular impuestos (8%)
                            const impuestos = subtotalProductos * 0.08;
                            
                            // Verificar si tiene envío
                            const tieneEnvio = selectedOrder.tipoEnvio && selectedOrder.tipoEnvio !== 'Recojo en tienda';
                            
                            // Calcular envío y comisión
                            // Total = subtotal + impuestos + envío + comisión
                            const subtotalConImpuestos = subtotalProductos + impuestos;
                            const diferencia = parseFloat(selectedOrder.total) - subtotalConImpuestos;
                            
                            // Si tiene envío, la diferencia incluye envío + comisión
                            // Si no tiene envío, la diferencia es solo comisión
                            let envio = 0;
                            let comision = 0;
                            
                            if (tieneEnvio && diferencia > 0) {
                              // Intentar estimar envío (puede variar, pero usamos una aproximación)
                              // O simplemente mostrar la diferencia como "Envío y otros cargos"
                              envio = diferencia;
                            } else {
                              comision = diferencia;
                            }
                            
                            return (
                              <>
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'right', paddingTop: '0.5rem' }}>Subtotal:</td>
                                  <td style={{ textAlign: 'right', paddingTop: '0.5rem' }}>S/.{subtotalProductos.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'right' }}>Impuestos (8%):</td>
                                  <td style={{ textAlign: 'right' }}>S/.{impuestos.toFixed(2)}</td>
                                </tr>
                                {tieneEnvio && envio > 0 && (
                                  <tr>
                                    <td colSpan="3" style={{ textAlign: 'right' }}>Envío:</td>
                                    <td style={{ textAlign: 'right' }}>S/.{envio.toFixed(2)}</td>
                                  </tr>
                                )}
                                {comision > 0 && (
                                  <tr>
                                    <td colSpan="3" style={{ textAlign: 'right' }}>Comisión método de pago:</td>
                                    <td style={{ textAlign: 'right' }}>S/.{comision.toFixed(2)}</td>
                                  </tr>
                                )}
                                <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '0.5rem' }}>Total:</td>
                                  <td style={{ fontWeight: 'bold', textAlign: 'right', paddingTop: '0.5rem', fontSize: '1.1rem' }}>S/.{parseFloat(selectedOrder.total).toFixed(2)}</td>
                                </tr>
                              </>
                            );
                          })()}
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;