import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useCarrito } from '../../context/carContext';
import './detalleproducto.css';

const API_URL = "http://localhost:5001";

// Fondos suaves para la caja de la imagen y el badge
const categoriaColors = {
  1: '#E1F5EE', // Lácteos
  2: '#E6F1FB', // Bebidas
  3: '#E1F5EE', // Abarrotes
  4: '#EEEDFE', // Embutidos
  5: '#EEEDFE', // Limpieza
  6: '#FAEEDA', // Snacks
  7: '#FAEEDA', // Panadería
  8: '#f4f6f8', // Otros
};

// Colores de texto para el badge (para que resalte sobre su fondo)
const categoriaTextColors = {
  1: '#0F6E56',
  2: '#0D47A1',
  3: '#0F6E56',
  4: '#283593',
  5: '#283593',
  6: '#E65100',
  7: '#E65100',
  8: '#424242',
};

const categoriaNombres = {
  1: 'Lácteos',
  2: 'Bebidas',
  3: 'Abarrotes',
  4: 'Embutidos',
  5: 'Limpieza',
  6: 'Snacks',
  7: 'Panadería',
  8: 'Otros',
};

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { agregarProducto } = useCarrito();

  // Resetear la cantidad a 1 cada vez que se abre un nuevo producto
  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, product]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const categoriaId = product?.categoria?.id || 8;
  const bgBadgeColor = categoriaColors[categoriaId] || '#f4f6f8';
  const textBadgeColor = categoriaTextColors[categoriaId] || '#424242';
  const categoriaNombre = categoriaNombres[categoriaId] || 'Producto';
  
  const precio = product ? parseFloat(product.precio) : 0;
  const total = (precio * quantity).toFixed(2);

  const handleAgregar = () => {
    agregarProducto({ ...product, cantidad: quantity });
    onClose();
  };

  if (!product || !isOpen) return null;

  return (
    <div
      className={`modal fade ${isOpen ? 'show d-block' : ''}`}
      tabIndex="-1"
      role="dialog"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content position-relative shadow-lg border-0">
          
          {/* Botón Cerrar Flotante */}
          <button
            type="button"
            className="btn-close-custom"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Cuerpo Unificado del Modal */}
          <div className="modal-body p-4 p-md-5">
            <div className="row g-4 align-items-center">

              {/* Columna Izquierda: Imagen en caja rectangular */}
              <div className="col-md-5">
                <div 
                  className="custom-image-box" 
                  style={{ backgroundColor: bgBadgeColor }}
                >
                  <img
                    src={`${API_URL}/${product.imagen}`}
                    alt={product.nombre}
                    className="img-fluid object-fit-contain"
                   
                  />
                </div>
              </div>

              {/* Columna Derecha: Detalles de Producto */}
              <div className="col-md-7">
                <div className="custom-details-col h-100 d-flex flex-column">
                  
                  {/* Encabezado: Categoría y Título */}
                  <div className="mb-3">
                    <span 
                      className="custom-category-badge mb-2"
                      style={{ backgroundColor: bgBadgeColor, color: textBadgeColor }}
                    >
                      {categoriaNombre}
                    </span>
                    <h2 className="custom-title">{product.nombre}</h2>
                  </div>

                  {/* Descripción y Marca */}
                  <p className="custom-description mb-2">{product.descripcion}</p>
                  {product.marca && (
                    <p className="custom-brand mb-3">
                      Marca: <strong>{product.marca}</strong>
                    </p>
                  )}

                  {/* Precio Principal */}
                  <div className="price-container mb-4">
                    <p className="custom-price">S/ {precio.toFixed(2)}</p>
                    <p className="custom-price-note">Precio unitario</p>
                  </div>

                  {/* Caja de Controles de Compra (Empujada al fondo) */}
                  <div className="purchase-controls mt-auto">
                    
                    {/* Fila Cantidad */}
                    <div className="custom-qty-row mb-3">
                      <span className="custom-qty-label">Cantidad</span>
                      <div className="custom-qty-group">
                        <button
                          className="custom-btn-quantity"
                          onClick={decrementQuantity}
                          aria-label="Reducir"
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span className="custom-qty-display">{quantity}</span>
                        <button
                          className="custom-btn-quantity"
                          onClick={incrementQuantity}
                          aria-label="Aumentar"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Fila Total */}
                    <div className="custom-total-row mb-3 d-flex justify-content-between align-items-center">
                      <span className="custom-total-label">Total estimado</span>
                      <span className="custom-total-value">S/ {total}</span>
                    </div>

                    {/* Botón CTA */}
                    <button
                      className="custom-btn-add-cart w-100"
                      onClick={handleAgregar}
                    >
                      <ShoppingCart size={20} strokeWidth={2.5} />
                      AGREGAR AL CARRITO
                    </button>
                    
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;