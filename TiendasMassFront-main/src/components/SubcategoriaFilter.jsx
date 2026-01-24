import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

/**
 * Componente para filtrar productos por subcategoría
 * Se muestra cuando una categoría tiene subcategorías
 */
const SubcategoriaFilter = ({ categoriaId, onSubcategoriaSelect, selectedSubcategoria = '' }) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (categoriaId) {
      setLoading(true);
      axios
        .get(`${API_URL}/subcategorias/categoria/${categoriaId}`)
        .then(res => {
          setSubcategorias(res.data);
        })
        .catch(err => {
          console.error('Error cargando subcategorías:', err);
          setSubcategorias([]);
        })
        .finally(() => setLoading(false));
    } else {
      setSubcategorias([]);
    }
  }, [categoriaId]);

  const handleSelect = (subcategoriaId) => {
    onSubcategoriaSelect(subcategoriaId);
  };

  const handleClear = () => {
    onSubcategoriaSelect('');
  };

  if (!categoriaId || subcategorias.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      borderLeft: '4px solid #ffc107'
    }}>
      <h5 style={{ marginBottom: '1rem', color: '#333', fontWeight: '600' }}>
        Filtrar por Subcategoría
      </h5>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        {loading ? (
          <p style={{ color: '#666', margin: 0 }}>Cargando subcategorías...</p>
        ) : (
          <>
            {subcategorias.map(subcategoria => (
              <button
                key={subcategoria.id}
                id={`subcategoria-${subcategoria.id}`}
                name={`subcategoria-filter-${subcategoria.id}`}
                onClick={() => handleSelect(subcategoria.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedSubcategoria === subcategoria.id ? '#ffc107' : '#fff',
                  border: selectedSubcategoria === subcategoria.id ? '2px solid #ff9800' : '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: selectedSubcategoria === subcategoria.id ? '600' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  color: selectedSubcategoria === subcategoria.id ? '#333' : '#666'
                }}
              >
                {subcategoria.nombre}
              </button>
            ))}
            {selectedSubcategoria && (
              <button
                id="clear-subcategoria-filter"
                name="clear-subcategoria-filter"
                onClick={handleClear}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e0e0e0',
                  border: '1px solid #999',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#333',
                  fontWeight: '500'
                }}
              >
                Limpiar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubcategoriaFilter;
