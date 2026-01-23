// steps/Step1Shipping.jsx
import React from 'react';
import { MapPin, User, Mail, Phone, Truck, Store } from 'lucide-react';
import { useCarrito } from '../../../context/carContext';
import { useUsuario } from '../../../context/userContext';

const Step1Shipping = ({
  formData,
  updateFormData,
  validation,
  metodosEnvio,
  selectedMetodoEnvioId,
  setSelectedMetodoEnvioId,
  userAddresses,
  selectedAddressId,
  handleAddressChange,
  useCustomAddress
}) => {
  const { carrito, aumentarCantidad, disminuirCantidad, quitarProducto } = useCarrito();
  const { usuario } = useUsuario();

  const parsePrice = (p) => (typeof p === 'number' ? p : (parseFloat(p) || 0));
  const normalizeImageUrl = (url) => {
    if (!url) return '/placeholder-image.jpg';
    return url.replace('http://localhost:3000', 'http://localhost:5001');
  };

  const handleFieldChange = (field, value) => {
    updateFormData(field, value);
    validation.validateSingleField(field, value);
  };

  return (
    <>
      {/* Resumen de Productos */}
      <div className="section-box payment-section">
        <h2><span>1</span> Resumen de Productos</h2>
        {carrito.length === 0 ? (
          <div className="empty-cart"><p>Tu carrito está vacío</p></div>
        ) : (
          carrito.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={normalizeImageUrl(item.imagen ? `http://localhost:5001/${item.imagen}` : '/placeholder-image.jpg')}
                alt={item.nombre}
                onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
              />
              <div className="cart-item-info">
                <strong>{item.title || item.nombre || 'Producto sin nombre'}</strong>
                <small> S/.{parsePrice(item.precio).toFixed(2)} c/u</small>
              </div>
              <div className="cart-item-actions">
                <button onClick={() => disminuirCantidad(item.id)} disabled={item.cantidad <= 1}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => aumentarCantidad(item.id)}>+</button>
                <button className="remove" onClick={() => quitarProducto(item.id)} title="Eliminar producto">✕</button>
              </div>
              <div className="cart-item-total">S/.{(parsePrice(item.precio) * item.cantidad).toFixed(2)}</div>
            </div>
          ))
        )}
      </div>

      {/* Información de Envío */}
      <div className="section-box shipping-form-container active">
        <div className="shipping-header">
          <div className="shipping-step-badge selected">2</div>
          <h2 className="shipping-title">Información de Envío</h2>
        </div>

        <div className="delivery-options">
          <button
            className={`delivery-btn ${formData.deliveryType === 'delivery' ? 'selected' : ''}`}
            onClick={() => handleFieldChange('deliveryType', 'delivery')}
          >
            <Truck className="delivery-icon" />
            <div>
              <div className="delivery-label">Envío a Domicilio</div>
              <div className="delivery-sub">Recibe en tu dirección</div>
            </div>
          </button>
          <button
            className={`delivery-btn ${formData.deliveryType === 'pickup' ? 'selected' : ''}`}
            onClick={() => handleFieldChange('deliveryType', 'pickup')}
          >
            <Store className="delivery-icon" />
            <div>
              <div className="delivery-label">Recojo en Tienda</div>
              <div className="delivery-sub">Retira en nuestro local (Gratis)</div>
            </div>
          </button>
        </div>

        {/* Selector de método de envío cuando es delivery */}
        {formData.deliveryType === 'delivery' && metodosEnvio.length > 0 && (
          <div className="form-group">
            <label className="form-label">Método de Envío *</label>
            <select
              className="form-select"
              value={selectedMetodoEnvioId || ''}
              onChange={(e) => setSelectedMetodoEnvioId(Number(e.target.value))}
            >
              <option value="">Seleccionar método de envío</option>
              {metodosEnvio.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} — S/.{parsePrice(m.precio).toFixed(2)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label"><User className="form-icon" />Nombre Completo *</label>
            <input
              className={`form-input ${validation.getFieldError('fullName').length > 0 ? 'input-error' : ''}`}
              value={formData.fullName || ''}
              onChange={e => handleFieldChange('fullName', e.target.value)}
            />
            {validation.getFieldError('fullName').map((error, index) => (
              <div key={index} className="error-messages">
                <span className="error-text">{error}</span>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label"><Mail className="form-icon" />Correo Electrónico *</label>
            <input
              className={`form-input ${validation.getFieldError('email').length > 0 ? 'input-error' : ''}`}
              type="email"
              value={formData.email || ''}
              onChange={e => handleFieldChange('email', e.target.value)}
            />
            {validation.getFieldError('email').map((error, index) => (
              <div key={index} className="error-messages">
                <span className="error-text">{error}</span>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label"><Phone className="form-icon" />Teléfono *</label>
            <input
              className={`form-input ${validation.getFieldError('phone').length > 0 ? 'input-error' : ''}`}
              type="tel"
              value={formData.phone || ''}
              onChange={e => handleFieldChange('phone', e.target.value)}
              maxLength="15"
              placeholder="987654321 o 01 234567"
            />
            {validation.getFieldError('phone').map((error, index) => (
              <div key={index} className="error-messages">
                <span className="error-text">{error}</span>
              </div>
            ))}
          </div>

          {formData.deliveryType === 'pickup' && (
            <div className="form-group full">
              <label className="form-label"><Store className="form-icon" />Seleccionar Tienda *</label>
              <select
                className={`form-select ${validation.getFieldError('selectedStore').length > 0 ? 'input-error' : ''}`}
                value={formData.selectedStore || ''}
                onChange={e => handleFieldChange('selectedStore', e.target.value)}
              >
                <option value="">Seleccionar tienda</option>
                <option value="Centro – Av. Principal 123">Centro – Av. Principal 123</option>
                <option value="Norte – Calle Comercial 456">Norte – Calle Comercial 456</option>
                <option value="Sur – Plaza Shopping 789">Sur – Plaza Shopping 789</option>
                <option value="Este – Mall Central 101">Este – Mall Central 101</option>
              </select>
              {validation.getFieldError('selectedStore').map((error, index) => (
                <div key={index} className="error-messages">
                  <span className="error-text">{error}</span>
                </div>
              ))}
            </div>
          )}

          {formData.deliveryType === 'delivery' && (
            <>
              {usuario && userAddresses.length > 0 && (
                <div className="form-group full">
                  <label className="form-label"><MapPin className="form-icon" />Seleccionar Dirección</label>
                  <div className="address-selector">
                    <select
                      className="form-select"
                      value={selectedAddressId}
                      onChange={(e) => handleAddressChange(e.target.value)}
                    >
                      <option value="">Seleccionar dirección guardada</option>
                      {userAddresses.map(address => (
                        <option key={address.id} value={address.id.toString()}>
                          {address.nombre} - {address.calle}, {address.ciudad}{address.esPrincipal && ' (Principal)'}
                        </option>
                      ))}
                      <option value="custom">+ Agregar dirección nueva</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedAddressId && selectedAddressId !== 'custom' && !useCustomAddress && (
                <div className="form-group full">
                  <div className="selected-address-display">
                    <strong>Dirección seleccionada:</strong>
                    {(() => {
                      const a = userAddresses.find(addr => addr.id.toString() === selectedAddressId);
                      return a ? (
                        <div className="address-info">
                          <div>{a.calle}</div>
                          <div>{a.ciudad}, {a.codigoPostal}</div>
                          {a.referencia && <div><small>Referencia: {a.referencia}</small></div>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {(useCustomAddress || !usuario || userAddresses.length === 0) && (
                <>
                  <div className="form-group full">
                    <label className="form-label"><MapPin className="form-icon" />Dirección *</label>
                    <input
                      className={`form-input ${validation.getFieldError('address').length > 0 ? 'input-error' : ''}`}
                      value={formData.address || ''}
                      onChange={e => handleFieldChange('address', e.target.value)}
                      placeholder="Calle, número, departamento"
                    />
                    {validation.getFieldError('address').map((error, index) => (
                      <div key={index} className="error-messages">
                        <span className="error-text">{error}</span>
                      </div>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad *</label>
                    <input
                      className={`form-input ${validation.getFieldError('city').length > 0 ? 'input-error' : ''}`}
                      value={formData.city || ''}
                      onChange={e => handleFieldChange('city', e.target.value)}
                      placeholder="Lima, Arequipa, etc."
                    />
                    {validation.getFieldError('city').map((error, index) => (
                      <div key={index} className="error-messages">
                        <span className="error-text">{error}</span>
                      </div>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código Postal *</label>
                    <input
                      className={`form-input ${validation.getFieldError('zipCode').length > 0 ? 'input-error' : ''}`}
                      value={formData.zipCode || ''}
                      onChange={e => handleFieldChange('zipCode', e.target.value)}
                      placeholder="15001"
                    />
                    {validation.getFieldError('zipCode').map((error, index) => (
                      <div key={index} className="error-messages">
                        <span className="error-text">{error}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Step1Shipping;