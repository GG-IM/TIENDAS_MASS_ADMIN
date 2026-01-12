// src/pages/CheckoutSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useUsuario } from '../context/userContext';

const API_URL = 'http://localhost:5000';

export default function CheckoutSuccessPage() {
  const { usuario } = useUsuario();

  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('Confirmando tu pago con Mercado Pago...');
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🟢 CheckoutSuccessPage montado. usuario:', usuario);
    console.log('🌐 API_URL en CheckoutSuccessPage:', API_URL);

    const confirmarPago = async () => {
      console.log('🔹 Iniciando confirmarPago()...');

      // Si no hay usuario logueado
      if (!usuario?.id) {
        console.warn('⚠️ No hay usuario.id en contexto');
        setError('No se encontró un usuario activo. Inicia sesión para ver tus pedidos.');
        setLoading(false);
        return;
      }

      console.log('👤 Usuario ID detectado:', usuario.id);

      try {
        // 1) Traer los pedidos del usuario
        const urlPedidos = `${API_URL}/api/pedidos/usuario/${usuario.id}`;
        console.log('📥 Fetch pedidos URL:', urlPedidos);

        const resp = await fetch(urlPedidos);
        console.log('📥 Respuesta fetch pedidos - status:', resp.status);

        if (!resp.ok) {
          throw new Error('No se pudieron obtener tus pedidos.');
        }

        const pedidosUsuario = await resp.json();
        console.log('📦 Pedidos del usuario recibidos:', pedidosUsuario);

        if (!Array.isArray(pedidosUsuario) || pedidosUsuario.length === 0) {
          console.warn('⚠️ pedidosUsuario vacío o no es array');
          setError('No se encontró ningún pedido asociado a tu cuenta.');
          setLoading(false);
          return;
        }

        // 2) Ordenar del más nuevo al más antiguo
        const ordenados = [...pedidosUsuario].sort((a, b) => {
          const fechaA = new Date(a.fecha_pedido || a.creadoEn || 0).getTime();
          const fechaB = new Date(b.fecha_pedido || b.creadoEn || 0).getTime();
          return fechaB - fechaA;
        });

        console.log('📊 Pedidos ordenados (más nuevo primero):', ordenados);

        // 3) Buscar el último pedido cuyo estado_pago NO sea COMPLETADO
        const pendiente = ordenados.find((p) => {
          const estado = (p.estado_pago || p.estadoPago || '').toString().toUpperCase();
          console.log(
            `🔎 Revisando pedido ID=${p.id}, estado_pago detectado=`,
            estado
          );
          return estado !== 'COMPLETADO';
        });

        console.log('🧾 Pedido seleccionado como pendiente (si existe):', pendiente);

        // Si todos ya estaban completados
        if (!pendiente) {
          console.log('✅ Todos los pedidos están COMPLETADOS, no hay pendiente que actualizar.');
          setMensaje('Tu pago ya estaba registrado como completado. ✅');
          setPedido(ordenados[0]); // mostramos el último por referencia
          setLoading(false);
          return;
        }

        // 4) Hacer PATCH al backend para marcarlo como COMPLETADO
        const patchUrl = `${API_URL}/api/pedidos/${pendiente.id}/estado-pago`;
        const bodyPatch = { estadoPago: 'COMPLETADO' };

        console.log('🚀 Enviando PATCH a:', patchUrl);
        console.log('📤 Body del PATCH:', bodyPatch);

        const patchResp = await fetch(patchUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPatch),
        });

        console.log('📥 Respuesta PATCH - status:', patchResp.status);

        if (!patchResp.ok) {
          const errorText = await patchResp.text().catch(() => '');
          console.error('❌ PATCH no OK. Body:', errorText);
          throw new Error('No se pudo actualizar el estado de pago en el servidor.');
        }

        const patchData = await patchResp.json();
        console.log('✅ Estado de pago actualizado desde /checkout/success:', patchData);

        setPedido({
          ...pendiente,
          estado_pago: 'COMPLETADO',
        });
        setMensaje('¡Pago confirmado con éxito! 🎉');
        setLoading(false);
      } catch (err) {
        console.error('❌ Error en confirmarPago():', err);
        setError(err.message || 'Ocurrió un error al confirmar tu pago.');
        setLoading(false);
      }
    };

    confirmarPago();
  }, [usuario?.id]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '8px' }}>Resultado del Pago</h1>

        {loading && <p style={{ marginTop: '12px' }}>{mensaje}</p>}

        {!loading && error && (
          <>
            <p style={{ color: '#c00', marginTop: '12px' }}>{error}</p>
            <button
              style={{
                marginTop: '16px',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#333',
                color: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => (window.location.href = '/')}
            >
              Volver a la tienda
            </button>
          </>
        )}

        {!loading && !error && (
          <>
            <p style={{ marginTop: '12px' }}>{mensaje}</p>

            {pedido && (
              <div
                style={{
                  marginTop: '18px',
                  textAlign: 'left',
                  background: '#fafafa',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                }}
              >
                <p>
                  <strong>N° de pedido:</strong> #{pedido.id}
                </p>
                <p>
                  <strong>Estado del pago:</strong>{' '}
                  {(pedido.estado_pago || 'COMPLETADO').toString().toUpperCase()}
                </p>
                {pedido.direccionEnvio && (
                  <p>
                    <strong>Entrega:</strong> {pedido.direccionEnvio}
                  </p>
                )}
                {pedido.montoTotal && (
                  <p>
                    <strong>Monto:</strong> S/.
                    {Number(pedido.montoTotal).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <button
              style={{
                marginTop: '18px',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#4caf50',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => (window.location.href = '/')}
            >
              Volver a la tienda
            </button>
          </>
        )}
      </div>
    </div>
  );
}
