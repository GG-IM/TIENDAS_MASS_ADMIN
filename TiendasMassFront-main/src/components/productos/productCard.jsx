import { useState } from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import './productcard.css';
const API_URL = "http://localhost:5000";


const categoriaColors = {
  1: '#33DDC8',
  2: '#7ACEFC',
  3: '#33DDC8',
  4: '#B097DF',
  5: '#B097DF',
  6: '#F5DB3D',
  7: '#F5DB3D',
  8: '#FBBF24',
};

export default function ProductCard({ producto, onAdd, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(producto);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAdd({ ...producto, cantidad: quantity });
    // Anunciar acción a lectores de pantalla
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${producto.nombre} agregado al carrito`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <article
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(producto)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Producto: ${producto.nombre}. Marca: ${producto.marca}. Precio: S/ ${parseFloat(producto.precio).toFixed(2)}. ${producto.descripcion}`}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="image-container"
        style={{
          backgroundColor: categoriaColors[producto.categoria?.id] || '#5EEAD4',
        }}
      >
        <img
          src={`${API_URL}/${producto.imagen}`}
          alt={`Imagen del producto ${producto.nombre} de la marca ${producto.marca}`}
          className={`product-image ${isHovered ? 'hovered' : ''}`}
          loading="lazy"
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{producto.nombre}</h3>
        <h4 className="product-brand" aria-label={`Marca: ${producto.marca}`}>{producto.marca}</h4>
        <p className="product-description">{producto.descripcion}</p>
        <p className="product-price" aria-label={`Precio: ${parseFloat(producto.precio).toFixed(2)} soles`}>
          S/ {parseFloat(producto.precio).toFixed(2)}
        </p>

        <button
          onClick={handleAddToCart}
          className="add-cart-btn"
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          <span>Añadir al carrito</span>
        </button>
      </div>
    </article>
  );
}

