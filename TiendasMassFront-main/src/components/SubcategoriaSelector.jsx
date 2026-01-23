import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

/**
 * Componente selector de subcategorías
 * Carga dinámicamente las subcategorías cuando cambia la categoría
 */
const SubcategoriaSelector = ({ 
  categoriaId, 
  subcategoriaId, 
  onChange,
  isRequired = false,
  className = '',
  disabled = false,
  showLabel = true
}) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (categoriaId) {
      setLoading(true);
      setError('');
      axios
        .get(`${API_URL}/subcategorias/categoria/${categoriaId}`)
        .then(res => {
          setSubcategorias(res.data);
        })
        .catch(err => {
          console.error('Error cargando subcategorías:', err);
          setError('Error al cargar subcategorías');
          setSubcategorias([]);
        })
        .finally(() => setLoading(false));
    } else {
      setSubcategorias([]);
      setError('');
    }
  }, [categoriaId]);

  return (
    <div className={className}>
      {showLabel && (
        <label htmlFor="subcategoriaId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Subcategoría {isRequired && '*'}
        </label>
      )}
      <select
        id="subcategoriaId"
        value={subcategoriaId || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading || !categoriaId || subcategorias.length === 0}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '1rem',
          backgroundColor: disabled ? '#f0f0f0' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <option value="">
          {loading ? 'Cargando subcategorías...' : 'Selecciona una subcategoría'}
        </option>
        {subcategorias.length > 0 && !loading && (
          subcategorias.map(subcategoria => (
            <option key={subcategoria.id} value={subcategoria.id}>
              {subcategoria.nombre}
            </option>
          ))
        )}
      </select>
      {error && <p style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>}
      {!loading && categoriaId && subcategorias.length === 0 && (
        <p style={{ color: '#ff6f00', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          No hay subcategorías para esta categoría
        </p>
      )}
      {!categoriaId && (
        <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Selecciona una categoría primero
        </p>
      )}
    </div>
  );
};

export default SubcategoriaSelector;
