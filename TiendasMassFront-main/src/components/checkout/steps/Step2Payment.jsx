// steps/Step2Payment.jsx
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Wallet } from "@mercadopago/sdk-react";
import { paymentService } from '../services/paymentService';

const Step2Payment = ({
  metodosPago,
  userCards,
  paymentMethod,
  selectedCardId,
  handlePaymentMethodChange,
  cardInfo,
  updateCardInfo,
  showMpWallet,
  mpPrefId
}) => {
  const selectedMethodObj = paymentMethod === 'userCard'
    ? metodosPago.find(m => m.tipo === 'tarjeta' || m.nombre?.toLowerCase().includes('tarjeta'))
    : metodosPago.find(m => m.id?.toString() === paymentMethod);

  const esMercadoPago = paymentService.isMpMethod(selectedMethodObj);

  const handleCardChange = (field, value) => {
    updateCardInfo(field, value);
  };

  return (
    <div className="section-box payment-section">
      <h2><span>3</span> Método de Pago</h2>

      <div className="payment-options">
        {userCards.length > 0 && (
          <div className="user-cards-section">
            <h4>Mis Tarjetas Guardadas</h4>
            {userCards.map(tarjeta => (
              <label key={`card-${tarjeta.id}`} className={`payment-option ${paymentMethod === 'userCard' && selectedCardId === tarjeta.id.toString() ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value={`card-${tarjeta.id}`}
                  checked={paymentMethod === 'userCard' && selectedCardId === tarjeta.id.toString()}
                  onChange={() => handlePaymentMethodChange('userCard', tarjeta.id.toString())}
                />
                <div className="payment-labels">
                  <strong>{tarjeta.tipoTarjeta}</strong>
                  <small>{tarjeta.numeroEnmascarado}</small>
                  <small>Expira: {tarjeta.fechaVencimiento}</small>
                </div>
                <div className="payment-logos"><CreditCard size={20} /></div>
              </label>
            ))}
          </div>
        )}

        {userCards.length > 0 && metodosPago.length > 0 && (
          <div className="payment-separator"><span>O usar otro método de pago</span></div>
        )}

        {metodosPago.length > 0 ? (
          metodosPago.map(metodo => (
            <label key={metodo.id} className={`payment-option ${paymentMethod === metodo.id.toString() ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value={metodo.id.toString()}
                checked={paymentMethod === metodo.id.toString()}
                onChange={() => handlePaymentMethodChange('generic', metodo.id.toString())}
              />
              <div className="payment-labels">
                <strong>{metodo.nombre}</strong>
                <small>{metodo.descripcion}</small>
                {metodo.comision > 0 && <small>Comisión: {metodo.comision}%</small>}
              </div>
              {metodo.logo && <div className="payment-logos"><img src={metodo.logo} alt={metodo.nombre} /></div>}
            </label>
          ))
        ) : (
          <div className="no-payment-methods"><p>Cargando métodos de pago...</p></div>
        )}
      </div>

      {/* Formularios condicionales por método */}
      {paymentMethod && (() => {
        if (esMercadoPago && showMpWallet && mpPrefId) {
          return (
            <div className="mp-brick-box" style={{ marginTop: 16 }}>
              <h4>Completa tu pago con Mercado Pago</h4>
              <Wallet
                initialization={{ preferenceId: mpPrefId }}
                customization={{ texts: { valueProp: "smart_option" } }}
              />
              <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: '#1976D2' }}>
                  💡 <strong>Importante:</strong> Después de completar el pago en MercadoPago, puedes volver a esta página.
                  El sistema verificará automáticamente tu pago en unos segundos.
                </p>
                <small style={{ color: '#1565C0' }}>No cierres esta página mientras se verifica tu transacción.</small>
              </div>
            </div>
          );
        }

        if (esMercadoPago) {
          return <div className="mp-loading"><p>Preparando pago seguro con Mercado Pago...</p></div>;
        }

        const isCardMethod = selectedMethodObj?.tipo === 'tarjeta' || selectedMethodObj?.nombre?.toLowerCase().includes('tarjeta');
        if (isCardMethod) {
          return (
            <div className="card-form">
              <div className="form-row">
                <label>Número de Tarjeta *</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardInfo.number}
                  onChange={e => handleCardChange('number', e.target.value)}
                  maxLength="19"
                  required
                />
              </div>
              <div className="form-row split-2">
                <div>
                  <label>Fecha de Vencimiento *</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardInfo.expiry}
                    onChange={e => handleCardChange('expiry', e.target.value)}
                    maxLength="5"
                    required
                  />
                </div>
                <div>
                  <label>CVV *</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardInfo.cvv}
                    onChange={e => handleCardChange('cvv', e.target.value)}
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <label>Nombre en la Tarjeta *</label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={cardInfo.nameOnCard}
                  onChange={e => handleCardChange('nameOnCard', e.target.value)}
                  required
                />
              </div>
            </div>
          );
        }

        return null;
      })()}
    </div>
  );
};

export default Step2Payment;