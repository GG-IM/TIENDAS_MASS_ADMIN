import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert2';

const URL = "http://localhost:5001";

const SubcategoryManager = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    estado: true
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const API_URL = `${URL}/api/subcategorias`;
  const CATEGORIES_URL = `${URL}/api/categorias`;

  // Constantes para validaciones
  const VALIDATION_RULES = {
    NOMBRE_MIN_LENGTH: 3,
    NOMBRE_MAX_LENGTH: 50,
    DESCRIPCION_MAX_LENGTH: 200,
    NOMBRE_REGEX: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/
  };

  // Cargar subcategorías y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subcatRes, catRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(CATEGORIES_URL)
        ]);
        console.log('📦 Subcategorías recibidas:', subcatRes.data);
        console.log('📂 Categorías recibidas:', catRes.data);
        setSubcategories(subcatRes.data);
        setCategories(catRes.data);
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron obtener los datos.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSubcategories = Array.isArray(subcategories)
    ? subcategories.filter(subcategory =>
      (subcategory.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subcategory.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subcategory.categoria?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre || formData.nombre.trim() === '') {
      errors.nombre = 'El nombre de la subcategoría es obligatorio';
      setFieldErrors(errors);
      return false;
    }

    if (!formData.categoriaId) {
      errors.categoriaId = 'Debes seleccionar una categoría';
      setFieldErrors(errors);
      return false;
    }

    const nombre = formData.nombre.trim();
    const descripcion = formData.descripcion.trim();

    if (nombre.length < VALIDATION_RULES.NOMBRE_MIN_LENGTH) {
      errors.nombre = `El nombre debe tener al menos ${VALIDATION_RULES.NOMBRE_MIN_LENGTH} caracteres`;
    }

    if (nombre.length > VALIDATION_RULES.NOMBRE_MAX_LENGTH) {
      errors.nombre = `El nombre no puede exceder ${VALIDATION_RULES.NOMBRE_MAX_LENGTH} caracteres`;
    }

    if (nombre && !VALIDATION_RULES.NOMBRE_REGEX.test(nombre)) {
      errors.nombre = 'El nombre solo puede contener letras, números, espacios, guiones y guiones bajos';
    }

    if (descripcion.length > VALIDATION_RULES.DESCRIPCION_MAX_LENGTH) {
      errors.descripcion = `La descripción no puede exceder ${VALIDATION_RULES.DESCRIPCION_MAX_LENGTH} caracteres`;
    }

    // Validar nombres duplicados en la misma categoría
    const nombreExistente = subcategories.find(subcat => 
      subcat.nombre.toLowerCase() === nombre.toLowerCase() && 
      subcat.categoriaId === parseInt(formData.categoriaId) &&
      subcat.id !== editingSubcategory?.id
    );

    if (nombreExistente) {
      errors.nombre = 'Ya existe una subcategoría con este nombre en esta categoría';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      nombre: subcategory.nombre,
      descripcion: subcategory.descripcion,
      categoriaId: subcategory.categoria?.id?.toString() || '',
      estado: subcategory.estado?.nombre === 'Activo'
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSubcategory(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoriaId: '',
      estado: true
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const nombreLimpio = formData.nombre.trim();
    const descripcionLimpia = formData.descripcion.trim();

    if (!nombreLimpio) {
      swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'El nombre no puede estar vacío',
      });
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        nombre: nombreLimpio,
        descripcion: descripcionLimpia,
        categoriaId: parseInt(formData.categoriaId)
      };

      if (typeof formData.estado === 'number' && !isNaN(formData.estado)) {
        dataToSend.estado = formData.estado;
      }

      if (editingSubcategory) {
        // Actualizar
        const response = await axios.put(`${API_URL}/${editingSubcategory.id}`, dataToSend);

        setSubcategories(subcategories.map(s =>
          s.id === editingSubcategory.id ? response.data : s
        ));
        
        swal.fire({
          icon: 'success',
          title: 'Actualizada',
          text: 'Subcategoría actualizada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Crear
        const res = await axios.post(API_URL, dataToSend);
        setSubcategories([res.data, ...subcategories]);
        
        swal.fire({
          icon: 'success',
          title: 'Creada',
          text: 'Subcategoría creada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setShowModal(false);
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar la subcategoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: '¿Está seguro de eliminar esta subcategoría?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/${id}`);
        setSubcategories(subcategories.filter(s => s.id !== id));
        swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La subcategoría ha sido eliminada.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la subcategoría.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (subcategory) => {
    if (subcategory.estado?.nombre === 'Activo' && subcategory.productos?.length > 0) {
      const result = await swal.fire({
        title: '¡Atención!',
        text: `Esta subcategoría tiene ${subcategory.productos.length} producto(s) asociado(s). ¿Desea desactivarla de todas formas?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setLoading(true);
      const newEstadoId = subcategory.estado?.id === 1 ? 2 : 1;
      
      const response = await axios.put(`${API_URL}/${subcategory.id}`, {
        estado: newEstadoId
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      setSubcategories(subcategories.map(s => s.id === subcategory.id ? response.data : s));
      
      swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La subcategoría ha sido ${newEstadoId === 1 ? 'activada' : 'desactivada'}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo cambiar el estado de la subcategoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && subcategories.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-mass-blue" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager fade-in">
      <style>{`
        .subcategorias-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          color: white;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        }

        .subcategorias-header h1 {
          color: white;
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 2.2rem;
        }

        .subcategorias-header p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0;
          font-size: 1.05rem;
          opacity: 0.95;
        }

        .table-header-enhanced {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .table-title-enhanced {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .table-title-enhanced::before {
          content: '📋';
          font-size: 1.8rem;
        }

        .table-actions-enhanced {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box-enhanced {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-input-enhanced {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background-color: #f8f9fa;
        }

        .search-input-enhanced:focus {
          outline: none;
          border-color: #667eea;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon-enhanced {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          pointer-events: none;
        }

        .btn-add-enhanced {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-add-enhanced:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-add-enhanced:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .table-wrapper {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .table-responsive-enhanced {
          overflow-x: auto;
        }

        .table-enhanced {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .table-enhanced thead {
          background: linear-gradient(135deg, #f5f7fa 0%, #eff0f7 100%);
          border-bottom: 2px solid #e0e0e0;
        }

        .table-enhanced th {
          padding: 1.25rem;
          text-align: left;
          font-weight: 700;
          color: #333;
          font-size: 0.95rem;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .table-enhanced tbody tr {
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .table-enhanced tbody tr:hover {
          background-color: #f8f9fa;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .table-enhanced td {
          padding: 1.25rem;
          color: #555;
          font-size: 0.95rem;
        }

        .table-enhanced strong {
          color: #333;
          font-weight: 600;
        }

        .badge-enhanced {
          display: inline-block;
          padding: 0.5rem 0.875rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.3px;
        }

        .badge-category {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .badge-products {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .badge-active {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
        }

        .badge-inactive {
          background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          color: white;
          cursor: pointer;
        }

        .badge-inactive:hover {
          transform: scale(1.05);
        }

        .btn-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action-enhanced {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .btn-edit-enhanced {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-edit-enhanced:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-delete-enhanced {
          background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          color: white;
        }

        .btn-delete-enhanced:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(235, 51, 73, 0.4);
        }

        .btn-action-enhanced:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #999;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state-text {
          font-size: 1.1rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .table-header-enhanced {
            flex-direction: column;
            align-items: stretch;
          }

          .table-actions-enhanced {
            flex-direction: column;
          }

          .search-box-enhanced {
            min-width: auto;
          }

          .table-enhanced th,
          .table-enhanced td {
            padding: 0.75rem;
            font-size: 0.85rem;
          }

          .subcategorias-header {
            padding: 1.5rem;
          }

          .subcategorias-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="subcategorias-header">
        <h1>Gestión de Subcategorías</h1>
        <p>Organiza y administra las subcategorías de productos</p>
      </div>

      <div className="table-header-enhanced">
        <h3 className="table-title-enhanced">Lista de Subcategorías</h3>
        <div className="table-actions-enhanced">
          <div className="search-box-enhanced">
            <input
              type="text"
              className="search-input-enhanced"
              placeholder="Buscar por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="search-icon-enhanced" size={18} />
          </div>
          <button className="btn-add-enhanced" onClick={handleAdd} disabled={loading}>
            <Plus size={18} />
            Agregar
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-responsive-enhanced">
          <table className="table-enhanced">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubcategories.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <p className="empty-state-text">
                        {searchTerm ? 'No se encontraron subcategorías' : 'No hay subcategorías registradas'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubcategories.map((subcategory) => (
                  <tr key={subcategory.id}>
                    <td><strong>{subcategory.nombre}</strong></td>
                    <td>{subcategory.descripcion || '-'}</td>
                    <td>
                      <span className="badge-enhanced badge-category">
                        {subcategory.categoria?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge-enhanced badge-products">
                        {subcategory.productos?.length || 0} {subcategory.productos?.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge-enhanced ${subcategory.estado?.nombre === 'Activo' ? 'badge-active' : 'badge-inactive'}`}
                        onClick={() => toggleActive(subcategory)}
                        style={{ border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        disabled={loading}
                      >
                        {subcategory.estado?.nombre === 'Activo' ? '✓ Activa' : '✗ Inactiva'}
                      </button>
                    </td>
                    <td>
                      <div className="btn-actions">
                        <button
                          className="btn-action-enhanced btn-edit-enhanced"
                          onClick={() => handleEdit(subcategory)}
                          title="Editar"
                          disabled={loading}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action-enhanced btn-delete-enhanced"
                          onClick={() => handleDelete(subcategory.id)}
                          title="Eliminar"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <style>{`
            .modal-enhanced {
              background: white;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              width: 90%;
              max-width: 500px;
              overflow: hidden;
              animation: slideUp 0.3s ease;
            }

            .modal-header-enhanced {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 2rem;
              color: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .modal-title-enhanced {
              font-size: 1.5rem;
              font-weight: 700;
              margin: 0;
              display: flex;
              align-items: center;
              gap: 0.75rem;
            }

            .modal-title-enhanced::before {
              content: '✏️';
              font-size: 1.5rem;
            }

            .modal-close-enhanced {
              background: rgba(255, 255, 255, 0.2);
              border: none;
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              transition: all 0.3s ease;
            }

            .modal-close-enhanced:hover {
              background: rgba(255, 255, 255, 0.3);
            }

            .modal-body-enhanced {
              padding: 2rem;
            }

            .form-group-enhanced {
              margin-bottom: 1.5rem;
            }

            .form-label-enhanced {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #333;
              font-size: 0.95rem;
            }

            .form-label-enhanced small {
              color: #999;
              font-weight: 400;
              margin-left: 0.5rem;
            }

            .form-input-enhanced,
            .form-select-enhanced,
            .form-textarea-enhanced {
              width: 100%;
              padding: 0.75rem 1rem;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 0.95rem;
              font-family: inherit;
              transition: all 0.3s ease;
              box-sizing: border-box;
            }

            .form-input-enhanced:focus,
            .form-select-enhanced:focus,
            .form-textarea-enhanced:focus {
              outline: none;
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
              background-color: white;
            }

            .form-input-enhanced.error,
            .form-select-enhanced.error,
            .form-textarea-enhanced.error {
              border-color: #f45c43;
              background-color: rgba(245, 92, 67, 0.05);
            }

            .form-textarea-enhanced {
              resize: vertical;
              min-height: 100px;
            }

            .form-help-text {
              font-size: 0.85rem;
              color: #999;
              margin-top: 0.4rem;
              display: block;
            }

            .form-error-message {
              color: #f45c43;
              font-size: 0.85rem;
              margin-top: 0.4rem;
              display: block;
              font-weight: 500;
            }

            .form-check-enhanced {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding: 1rem;
              background: #f8f9fa;
              border-radius: 8px;
            }

            .form-check-input-enhanced {
              width: 20px;
              height: 20px;
              cursor: pointer;
              accent-color: #667eea;
            }

            .form-check-label-enhanced {
              margin: 0;
              font-weight: 500;
              color: #333;
              cursor: pointer;
            }

            .modal-footer-enhanced {
              padding: 1.5rem 2rem;
              background: #f8f9fa;
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
              border-top: 1px solid #e0e0e0;
            }

            .btn-modal-enhanced {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 0.95rem;
            }

            .btn-cancel-enhanced {
              background: #e0e0e0;
              color: #333;
            }

            .btn-cancel-enhanced:hover {
              background: #d0d0d0;
            }

            .btn-submit-enhanced {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .btn-submit-enhanced:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }

            .btn-submit-enhanced:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
            }

            .spinner-mini {
              display: inline-block;
              width: 14px;
              height: 14px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 0.6s linear infinite;
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }

            @media (max-width: 640px) {
              .modal-enhanced {
                width: 95%;
              }

              .modal-body-enhanced {
                padding: 1.5rem;
              }

              .modal-footer-enhanced {
                padding: 1rem 1.5rem;
                flex-direction: column-reverse;
              }

              .btn-modal-enhanced {
                width: 100%;
              }
            }
          `}</style>

          <div className="modal-enhanced">
            <div className="modal-header-enhanced">
              <h5 className="modal-title-enhanced">
                {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
              </h5>
              <button
                type="button"
                className="modal-close-enhanced"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-enhanced">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    Categoría <span style={{ color: '#f45c43' }}>*</span>
                  </label>
                  <select
                    name="categoriaId"
                    className={`form-select-enhanced ${fieldErrors.categoriaId ? 'error' : ''}`}
                    value={formData.categoriaId}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">-- Seleccionar categoría --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.categoriaId && (
                    <span className="form-error-message">{fieldErrors.categoriaId}</span>
                  )}
                </div>
                
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    Nombre <span style={{ color: '#f45c43' }}>*</span>
                    <small>
                      ({formData.nombre.length}/{VALIDATION_RULES.NOMBRE_MAX_LENGTH})
                    </small>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    className={`form-input-enhanced ${fieldErrors.nombre ? 'error' : ''}`}
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Electrónica, Ropa, Alimentos"
                    maxLength={VALIDATION_RULES.NOMBRE_MAX_LENGTH}
                    required
                    disabled={loading}
                  />
                  {fieldErrors.nombre && (
                    <span className="form-error-message">{fieldErrors.nombre}</span>
                  )}
                  <span className="form-help-text">
                    Mínimo {VALIDATION_RULES.NOMBRE_MIN_LENGTH} caracteres. Solo letras, números, espacios y guiones.
                  </span>
                </div>
                
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    Descripción
                    <small>
                      ({formData.descripcion.length}/{VALIDATION_RULES.DESCRIPCION_MAX_LENGTH})
                    </small>
                  </label>
                  <textarea
                    name="descripcion"
                    className={`form-textarea-enhanced ${fieldErrors.descripcion ? 'error' : ''}`}
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe brevemente esta subcategoría"
                    maxLength={VALIDATION_RULES.DESCRIPCION_MAX_LENGTH}
                    disabled={loading}
                  />
                  {fieldErrors.descripcion && (
                    <span className="form-error-message">{fieldErrors.descripcion}</span>
                  )}
                </div>
                
                <div className="form-check-enhanced">
                  <input
                    type="checkbox"
                    name="estado"
                    className="form-check-input-enhanced"
                    id="estado"
                    checked={formData.estado}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label className="form-check-label-enhanced" htmlFor="estado">
                    Subcategoría activa
                  </label>
                </div>
              </div>
              <div className="modal-footer-enhanced">
                <button
                  type="button"
                  className="btn-modal-enhanced btn-cancel-enhanced"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-modal-enhanced btn-submit-enhanced" 
                  disabled={loading || !formData.nombre.trim() || !formData.categoriaId}
                >
                  {loading && <span className="spinner-mini"></span>}
                  {loading ? (editingSubcategory ? 'Actualizando...' : 'Guardando...') : (editingSubcategory ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryManager;
