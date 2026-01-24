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
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Subcategorías</h1>
          <p className="text-muted">Organiza y administra las subcategorías de productos</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Subcategorías</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar subcategorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" />
              Agregar Subcategoría
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
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
                  <td colSpan="6" className="text-center text-muted py-4">
                    {searchTerm ? 'No se encontraron subcategorías' : 'No hay subcategorías registradas'}
                  </td>
                </tr>
              ) : (
                filteredSubcategories.map((subcategory) => (
                  <tr key={subcategory.id}>
                    <td><strong>{subcategory.nombre}</strong></td>
                    <td>{subcategory.descripcion}</td>
                    <td>
                      <span className="badge badge-info">
                        {subcategory.categoria?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {subcategory.productos?.length || 0} productos
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge ${subcategory.estado?.nombre === 'Activo' ? 'badge-success' : 'badge-danger'}`}
                        onClick={() => toggleActive(subcategory)}
                        style={{ border: 'none', cursor: 'pointer' }}
                        disabled={loading}
                      >
                        {subcategory.estado?.nombre === 'Activo' ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-action btn-edit me-1"
                        onClick={() => handleEdit(subcategory)}
                        title="Editar"
                        disabled={loading}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(subcategory.id)}
                        title="Eliminar"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSubcategory ? 'Editar Subcategoría' : 'Agregar Subcategoría'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">
                      Categoría *
                    </label>
                    <select
                      name="categoriaId"
                      className={`form-control ${fieldErrors.categoriaId ? 'is-invalid' : ''}`}
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
                      <div className="invalid-feedback d-block">{fieldErrors.categoriaId}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Nombre * 
                      <small className="text-muted ms-2">
                        ({formData.nombre.length}/{VALIDATION_RULES.NOMBRE_MAX_LENGTH})
                      </small>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className={`form-control ${fieldErrors.nombre ? 'is-invalid' : ''}`}
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Electrónica, Ropa, Alimentos"
                      maxLength={VALIDATION_RULES.NOMBRE_MAX_LENGTH}
                      required
                      disabled={loading}
                    />
                    {fieldErrors.nombre && (
                      <div className="invalid-feedback d-block">{fieldErrors.nombre}</div>
                    )}
                    <small className="text-muted">
                      Mínimo {VALIDATION_RULES.NOMBRE_MIN_LENGTH} caracteres. Solo letras, números, espacios y guiones.
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Descripción
                      <small className="text-muted ms-2">
                        ({formData.descripcion.length}/{VALIDATION_RULES.DESCRIPCION_MAX_LENGTH})
                      </small>
                    </label>
                    <textarea
                      name="descripcion"
                      className={`form-control ${fieldErrors.descripcion ? 'is-invalid' : ''}`}
                      rows={3}
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe brevemente esta subcategoría"
                      maxLength={VALIDATION_RULES.DESCRIPCION_MAX_LENGTH}
                      disabled={loading}
                    ></textarea>
                    {fieldErrors.descripcion && (
                      <div className="invalid-feedback d-block">{fieldErrors.descripcion}</div>
                    )}
                  </div>
                  
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="estado"
                      className="form-check-input"
                      id="estado"
                      checked={formData.estado}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="estado">
                      Subcategoría activa
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue" disabled={loading || !formData.nombre.trim() || !formData.categoriaId}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingSubcategory ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingSubcategory ? 'Actualizar' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryManager;
