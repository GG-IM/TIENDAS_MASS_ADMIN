import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubcategoriaProductos from '../components/SubcategoriaProductos';
import SubcategoriaFilter from '../components/SubcategoriaFilter';

const API_URL = 'http://localhost:5001/api';

/**
 * Ejemplo de página que muestra categorías y sus subcategorías con productos
 * Puede servir como base para Home, búsqueda, o exploración de catálogo
 */
const CatalogoPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar categorías
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/categorias`)
      .then(res => {
        setCategorias(res.data);
        if (res.data.length > 0) {
          setSelectedCategoria(res.data[0].id); // Seleccionar primera por defecto
        }
      })
      .catch(err => {
        console.error('Error cargando categorías:', err);
        setError('Error al cargar el catálogo');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleProductClick = (producto) => {
    console.log('Producto seleccionado:', producto);
    // Aquí puedes navegar a detalle del producto, abrir modal, etc.
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Catálogo de Productos</h1>
      
      {/* Selector de categorías */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {categorias.map(categoria => (
          <button
            key={categoria.id}
            onClick={() => setSelectedCategoria(categoria.id)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: selectedCategoria === categoria.id ? '#ffc107' : '#fff',
              border: selectedCategoria === categoria.id ? '2px solid #ff9800' : '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: selectedCategoria === categoria.id ? '600' : '500',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>

      {/* Vista de subcategorías con productos */}
      {selectedCategoria && (
        <SubcategoriaProductos
          categoriaId={selectedCategoria}
          onProductClick={handleProductClick}
        />
      )}
    </div>
  );
};

export default CatalogoPage;

/**
 * EJEMPLO 2: Con filtro de subcategorías en vista de lista
 */
export const CatalogoPageConFiltro = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState('');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/categorias`)
      .then(res => {
        setCategorias(res.data);
        if (res.data.length > 0) {
          setSelectedCategoria(res.data[0].id);
        }
      })
      .catch(err => {
        console.error('Error cargando categorías:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Cargar productos cuando cambien categoría o subcategoría
  useEffect(() => {
    if (!selectedCategoria) return;

    axios
      .get(`${API_URL}/products`, {
        params: {
          categoriaId: selectedCategoria,
          ...(selectedSubcategoria && { subcategoriaId: selectedSubcategoria })
        }
      })
      .then(res => {
        setProductos(res.data);
      })
      .catch(err => {
        console.error('Error cargando productos:', err);
        setProductos([]);
      });
  }, [selectedCategoria, selectedSubcategoria]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Explorar Catálogo</h1>
      
      {/* Categorías */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {categorias.map(categoria => (
          <button
            key={categoria.id}
            onClick={() => {
              setSelectedCategoria(categoria.id);
              setSelectedSubcategoria(''); // Resetear subcategoría
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: selectedCategoria === categoria.id ? '#ffc107' : '#fff',
              border: selectedCategoria === categoria.id ? '2px solid #ff9800' : '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: selectedCategoria === categoria.id ? '600' : '500'
            }}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>

      {/* Filtro de subcategorías */}
      {selectedCategoria && (
        <SubcategoriaFilter
          categoriaId={selectedCategoria}
          onSubcategoriaSelect={setSelectedSubcategoria}
        />
      )}

      {/* Productos */}
      <div>
        <h3>
          {selectedSubcategoria 
            ? `${productos.length} productos encontrados` 
            : `Todos los productos (${productos.length})`}
        </h3>
        
        {productos.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {productos.map(producto => (
              <div
                key={producto.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
              >
                <img 
                  src={producto.imagen || '/placeholder.jpg'}
                  alt={producto.nombre}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <h5>{producto.nombre}</h5>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{producto.descripcion}</p>
                {producto.subcategoria && (
                  <p style={{ color: '#ff9800', fontWeight: '600', fontSize: '0.85rem' }}>
                    {producto.subcategoria.nombre}
                  </p>
                )}
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#333' }}>
                  ${Number(producto.precio).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>
            No hay productos disponibles
          </p>
        )}
      </div>
    </div>
  );
};
