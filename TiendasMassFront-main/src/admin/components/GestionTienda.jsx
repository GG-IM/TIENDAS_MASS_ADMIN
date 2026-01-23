import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = "http://localhost:5001";

const GestionTienda = () => {
  const [tiendas, setTiendas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTienda, setEditingTienda] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    activo: true
  });

  // =============================
  // Cargar tiendas
  // =============================
  const loadTiendas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tiendas`);
      if (!res.ok) throw new Error('Error al cargar tiendas');
      const data = await res.json();
      setTiendas(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudieron cargar las tiendas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiendas();
  }, []);

  // =============================
  // Filtro búsqueda
  // =============================
  const filteredTiendas = tiendas.filter(t =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.direccion && t.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // =============================
  // Validación
  // =============================
const validateForm = () => {
  const errors = {};

  const nombre = (formData.nombre || '').trim();
  const direccion = (formData.direccion || '').trim();

  // Obligatorios
  if (!nombre) errors.nombre = 'El nombre es obligatorio';
  if (!direccion) errors.direccion = 'La dirección es obligatoria';

  // Duplicados (mismo nombre) - ignorando el mismo registro si editas
  const duplicado = tiendas.find(t =>
    (t.nombre || '').trim().toLowerCase() === nombre.toLowerCase() &&
    t.id !== editingTienda?.id
  );
  if (duplicado) errors.nombre = 'Ya existe una tienda con este nombre';

  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};


  // =============================
  // Handlers
  // =============================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = () => {
    setEditingTienda(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      activo: true
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleEdit = (tienda) => {
    setEditingTienda(tienda);
    setFormData({
      nombre: tienda.nombre,
      direccion: tienda.direccion || '',
      telefono: tienda.telefono || '',
      activo: tienda.activo
    });
    setFieldErrors({});
    setShowModal(true);
  };

  // =============================
  // Crear / Actualizar
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const url = editingTienda
        ? `${API_URL}/api/tiendas/${editingTienda.id}`
        : `${API_URL}/api/tiendas`;

      const method = editingTienda ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        let msg = 'Error en la operación';
        try {
            const err = await res.json();
            msg = err.error || err.message || msg;
        } catch {Error}
        throw new Error(msg);
        }
      const data = await res.json();

      if (editingTienda) {
        setTiendas(tiendas.map(t => t.id === data.id ? data : t));
        Swal.fire('Éxito', 'Tienda actualizada correctamente', 'success');
      } else {
        setTiendas([...tiendas, data]);
        Swal.fire('Éxito', 'Tienda creada correctamente', 'success');
      }

      setShowModal(false);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Eliminar
  // =============================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar tienda?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tiendas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');

      setTiendas(tiendas.filter(t => t.id !== id));
      Swal.fire('Eliminado', 'Tienda eliminada correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Render
  // =============================
  return (
    <div className="fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Tiendas</h1>
          <p className="text-muted">Administra las tiendas del sistema</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Tiendas</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Buscar tienda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" /> Agregar Tienda
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTiendas.map(tienda => (
                <tr key={tienda.id}>
                  <td>{tienda.nombre}</td>
                  <td>{tienda.direccion || '—'}</td>
                  <td>{tienda.telefono || '—'}</td>
                  <td>
                    <span className={`badge ${tienda.activo ? 'badge-success' : 'badge-danger'}`}>
                      {tienda.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action btn-edit me-1" onClick={() => handleEdit(tienda)}>
                      <Edit size={14} />
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(tienda.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTiendas.length === 0 && (
            <div className="text-center py-4 text-muted">
              No se encontraron tiendas
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingTienda ? 'Editar Tienda' : 'Agregar Tienda'}
                  </h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      name="nombre"
                      className={`form-control ${fieldErrors.nombre ? 'is-invalid' : ''}`}
                      value={formData.nombre}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.nombre && <div className="invalid-feedback d-block">{fieldErrors.nombre}</div>}
                  </div>
                  
                    <div className="form-group">
                    <label>Dirección *</label>
                    <input
                        name="direccion"
                        className={`form-control ${fieldErrors.direccion ? 'is-invalid' : ''}`}
                        value={formData.direccion}
                        onChange={handleInputChange}
                    />
                    {fieldErrors.direccion && (
                        <div className="invalid-feedback d-block">{fieldErrors.direccion}</div>
                    )}
                    </div>


                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      name="telefono"
                      className="form-control"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    <label className="form-check-label">Tienda activa</label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue">
                    {editingTienda ? 'Actualizar' : 'Guardar'}
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

export default GestionTienda;
