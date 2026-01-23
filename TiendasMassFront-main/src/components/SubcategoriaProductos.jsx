import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './productos/productCard';

const API_URL = 'http://localhost:5001/api';

/**
 * Componente para mostrar subcategorías con sus productos
 * Muestra una vista en acordeón expandible por subcategoría
 */
const SubcategoriaProductos = ({ categoriaId, onProductClick }) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedSubcategorias, setExpandedSubcategorias] = useState({});
  const [error, setError] = useState('');

  // Cargar subcategorías
  useEffect(() => {
    if (!categoriaId) return;

    setLoading(true);
    setError('');
    
    axios
      .get(`${API_URL}/subcategorias/categoria/${categoriaId}`)
      .then(res => {
        setSubcategorias(res.data);
        // Expandir todas las subcategorías por defecto
        const expanded = {};
        res.data.forEach(sub => {
          expanded[sub.id] = true;
        });
        setExpandedSubcategorias(expanded);
      })
      .catch(err => {
        console.error('Error cargando subcategorías:', err);
        setError('Error al cargar subcategorías');
      })
      .finally(() => setLoading(false));
  }, [categoriaId]);

  // Cargar productos para cada subcategoría
  useEffect(() => {
    subcategorias.forEach(subcategoria => {
      if (!productos[subcategoria.id]) {
        axios
          .get(`${API_URL}/products?subcategoriaId=${subcategoria.id}`)
          .then(res => {
            setProductos(prev => ({
              ...prev,
              [subcategoria.id]: res.data
            }));
          })
          .catch(err => {
            console.error(`Error cargando productos para subcategoría ${subcategoria.id}:`, err);
            setProductos(prev => ({
              ...prev,
              [subcategoria.id]: []
            }));
          });
      }
    });
  }, [subcategorias]);

  const toggleSubcategoria = (subcategoriaId) => {
    setExpandedSubcategorias(prev => ({
      ...prev,
      [subcategoriaId]: !prev[subcategoriaId]
    }));
  };

  if (loading) {
    return <p>Cargando subcategorías...</p>;
  }

  if (error) {
    return <p style={{ color: '#d32f2f' }}>{error}</p>;
  }

  if (subcategorias.length === 0) {
    return <p>No hay subcategorías para esta categoría</p>;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {subcategorias.map(subcategoria => (
        <div
          key={subcategoria.id}
          style={{
            marginBottom: '1.5rem',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header de subcategoría */}
          <button
            onClick={() => toggleSubcategoria(subcategoria.id)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#ffc107',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#ffb300'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
          >
            <span>{subcategoria.nombre}</span>
            <span
              style={{
                fontSize: '1.5rem',
                transform: expandedSubcategorias[subcategoria.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              ▼
            </span>
          </button>

          {/* Productos de la subcategoría */}
          {expandedSubcategorias[subcategoria.id] && (
            <div
              style={{
                backgroundColor: '#fff',
                padding: '1.5rem'
              }}
            >
              {productos[subcategoria.id] && productos[subcategoria.id].length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1.5rem'
                  }}
                >
                  {productos[subcategoria.id].map(producto => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      onClick={() => onProductClick && onProductClick(producto)}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', textAlign: 'center' }}>
                  No hay productos en esta subcategoría
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SubcategoriaProductos;
