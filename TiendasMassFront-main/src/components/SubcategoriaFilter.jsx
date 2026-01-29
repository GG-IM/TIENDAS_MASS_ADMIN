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
      marginBottom: '2rem'
    }}>
      <style>{`
        .subcategoria-filter-container {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #eff0f7 100%);
          border-radius: 12px;
          border-left: 4px solid #667eea;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .subcategoria-filter-title {
          margin-bottom: 1.25rem;
          color: #333;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .subcategoria-filter-title::before {
          content: '🔍';
          font-size: 1.3rem;
        }

        .subcategoria-filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .subcategoria-filter-btn {
          padding: 0.65rem 1.25rem;
          background-color: white;
          border: 2px solid #e0e0e0;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #666;
          position: relative;
          overflow: hidden;
        }

        .subcategoria-filter-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: left 0.3s ease;
          z-index: -1;
        }

        .subcategoria-filter-btn:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .subcategoria-filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          font-weight: 600;
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
          transform: translateY(-2px);
        }

        .subcategoria-filter-clear {
          padding: 0.65rem 1.25rem;
          background-color: #f0f0f0;
          border: 2px solid #999;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #333;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .subcategoria-filter-clear:hover {
          background-color: #e0e0e0;
          border-color: #666;
          transform: translateY(-2px);
        }

        .subcategoria-filter-loading {
          color: #666;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .subcategoria-filter-container {
            padding: 1.25rem;
          }

          .subcategoria-filter-title {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .subcategoria-filter-btn,
          .subcategoria-filter-clear {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }

          .subcategoria-filter-buttons {
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="subcategoria-filter-container">
        <h5 className="subcategoria-filter-title">
          Filtrar por Subcategoría
        </h5>
        <div className="subcategoria-filter-buttons">
          {loading ? (
            <p className="subcategoria-filter-loading">⏳ Cargando subcategorías...</p>
          ) : (
            <>
              {subcategorias.map(subcategoria => (
                <button
                  key={subcategoria.id}
                  id={`subcategoria-${subcategoria.id}`}
                  name={`subcategoria-filter-${subcategoria.id}`}
                  onClick={() => handleSelect(subcategoria.id)}
                  className={`subcategoria-filter-btn ${selectedSubcategoria === subcategoria.id ? 'active' : ''}`}
                >
                  📁 {subcategoria.nombre}
                </button>
              ))}
              {selectedSubcategoria && (
                <button
                  id="clear-subcategoria-filter"
                  name="clear-subcategoria-filter"
                  onClick={handleClear}
                  className="subcategoria-filter-clear"
                >
                  ✕ Limpiar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoriaFilter;
