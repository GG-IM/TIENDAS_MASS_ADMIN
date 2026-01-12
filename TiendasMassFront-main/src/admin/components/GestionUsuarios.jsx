import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';
import swal from 'sweetalert2';
import {
  validateNombre,
  validateEmail,
  validatePassword,
  validateDireccion,
  validateTelefono,
  validateCiudad,
  validateCodigoPostal,
  validateUserForm,
  normalizeEmail,
  normalizeName
} from '../../utils/usuariosvalidaciones';

const GestionUsuario = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    codigoPostal: '',
    estadoId: 1,
    active: true,
  });
  const [errors, setErrors] = useState({});

  const API_URL = 'http://localhost:5000';

  // Mapeo de roles de BD a nombres para mostrar
  const rolMapping = {
    'admin': 'Administrador',
    'cliente': 'Cliente'
  };

  // Mapeo inverso para enviar a la BD
  const rolMappingReverse = {
    'Administrador': 'admin',
    'Cliente': 'cliente'
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get( `${API_URL}/api/roles`);  
      setRoles(response.data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/usuarios`);
      const formatted = response.data.map(user => ({
        ...user,
        rol: rolMapping[user.rol?.nombre] || user.rol?.nombre || 'Cliente',
        lastLogin: new Date().toISOString(),
        active: true,
      }));
      setUsers(formatted);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()); // ✅ Cambiar correo por email
    const matchRole = selectedRole === '' || user.rol.id.toString() === selectedRole; // ✅ Comparar IDs
    return matchSearch && matchRole;
  });
  const handleEdit = user => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.id?.toString() || user.rolId?.toString() || '2',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      ciudad: user.ciudad || '',
      codigoPostal: user.codigoPostal || '',
      estadoId: user.estadoId || user.estado?.id || 1,
      active: user.active ?? true,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '2',
      direccion: '',
      telefono: '',
      ciudad: '',
      codigoPostal: '',
      estadoId: 1,
      active: true,
    });
    setErrors({});
    setShowModal(true);
  };

  // Función para validar campo individual
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Validar el campo individual
    let fieldError = null;
    switch (field) {
      case 'nombre':
        fieldError = validateNombre(value);
        break;
      case 'email':
        fieldError = validateEmail(value);
        break;
      case 'password':
        fieldError = validatePassword(value, !editingUser);
        break;
      case 'direccion':
        fieldError = validateDireccion(value);
        break;
      case 'telefono':
        fieldError = validateTelefono(value);
        break;
      case 'ciudad':
        fieldError = validateCiudad(value);
        break;
      case 'codigoPostal':
        fieldError = validateCodigoPostal(value);
        break;
      default:
        break;
    }

    // Actualizar errores
    setErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError && fieldError.length > 0) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };



  const handleSubmit = async e => {
    e.preventDefault();

    // Validar formulario completo
    const formErrors = validateUserForm(formData, !!editingUser);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const dataToSend = {
        nombre: normalizeName(formData.nombre),
        email: normalizeEmail(formData.email),
        direccion: formData.direccion?.trim() || '',
        estadoId: formData.estadoId,
        telefono: formData.telefono?.trim() || '',
        ciudad: formData.ciudad?.trim() || '',
        codigoPostal: formData.codigoPostal?.trim() || '',
        rolId: parseInt(formData.rol)
      };

      // Agregar password solo si es un nuevo usuario o si se especificó
      if (!editingUser || formData.password) {
        dataToSend.password = formData.password;
      }

      if (editingUser) {
        await axios.put(`${API_URL}/api/usuarios/update/${editingUser.id}`, dataToSend);
        swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Usuario actualizado exitosamente',
        });
      } else {
        await axios.post(`${API_URL}/api/usuarios/register`, dataToSend);
        swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Usuario creado exitosamente',
        });
      }

      setShowModal(false);
      setErrors({});
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar usuario. Por favor, intenta de nuevo.',
      });
    }
  };

  const handleDelete = async id => {
    const result = await swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de eliminar este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/usuarios/delete/${id}`);
        swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Usuario eliminado exitosamente',
        });
        fetchUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar usuario.',
        });
      }
    }
  };


  const toggleActive = id => {
    setUsers(users.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const getRoleBadge = rol => {
    switch (rol) {
      case 'Administrador':
        return 'badge-danger';
      case 'Vendedor':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div className="user-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Usuarios</h1>
          <p className="text-muted">Administra usuarios del sistema</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Usuarios</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <select
              className="form-select"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {/* ✅ NUEVO - Dinámico */}
              {roles.map(rol => (
                <option key={rol.id} value={rol.id.toString()}>
                  {rol.nombre === 'admin' ? 'Administrador' :
                    rol.nombre === 'cliente' ? 'Cliente' : rol.nombre}
                </option>
              ))}
            </select>
            <button className="btn btn-mass-yellow" onClick={handleAdd}>
              <Plus size={16} className="me-1" />
              Agregar Usuario
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Último Acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.nombre}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.rol)}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(user.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {user.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    {/* <button className="btn-action btn-view me-1" title="Ver">
                      <Eye size={14} />
                    </button> */}
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(user.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre ? 'input-error' : ''}`}
                      value={formData.nombre}
                      onChange={e => handleFieldChange('nombre', e.target.value)}
                      required
                    />
                    {errors.nombre && (
                      <div className="error-messages">
                        {errors.nombre.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Correo *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'input-error' : ''}`}
                      value={formData.email}
                      onChange={e => handleFieldChange('email', e.target.value)}
                      required
                    />
                    {errors.email && (
                      <div className="error-messages">
                        {errors.email.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Contraseña {!editingUser && '*'}</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'input-error' : ''}`}
                      value={formData.password}
                      onChange={e => handleFieldChange('password', e.target.value)}
                      required={!editingUser}
                      placeholder={editingUser ? 'Dejar vacío para no cambiar' : ''}
                    />
                    {errors.password && (
                      <div className="error-messages">
                        {errors.password.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      className="form-select"
                      value={formData.rol}
                      onChange={e => setFormData({ ...formData, rol: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {/* ✅ NUEVO - Mapeo dinámico desde la BD */}
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id.toString()}>
                          {rol.nombre === 'admin' ? 'Administrador' :
                            rol.nombre === 'cliente' ? 'Cliente' : rol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      className={`form-control ${errors.direccion ? 'input-error' : ''}`}
                      value={formData.direccion}
                      onChange={e => handleFieldChange('direccion', e.target.value)}
                      placeholder="Ej: Av. Larco 1234, Miraflores"
                    />
                    {errors.direccion && (
                      <div className="error-messages">
                        {errors.direccion.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      className={`form-control ${errors.ciudad ? 'input-error' : ''}`}
                      value={formData.ciudad}
                      onChange={e => handleFieldChange('ciudad', e.target.value)}
                      placeholder="Ej: Lima"
                    />
                    {errors.ciudad && (
                      <div className="error-messages">
                        {errors.ciudad.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      className={`form-control ${errors.telefono ? 'input-error' : ''}`}
                      value={formData.telefono}
                      onChange={e => handleFieldChange('telefono', e.target.value)}
                      placeholder="Ej: +51 987 654 321"
                      maxLength="20"
                    />
                    {errors.telefono && (
                      <div className="error-messages">
                        {errors.telefono.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Código Postal</label>
                    <input
                      type="text"
                      className={`form-control ${errors.codigoPostal ? 'input-error' : ''}`}
                      value={formData.codigoPostal}
                      onChange={e => handleFieldChange('codigoPostal', e.target.value)}
                      placeholder="Ej: 15001"
                      maxLength="10"
                    />
                    {errors.codigoPostal && (
                      <div className="error-messages">
                        {errors.codigoPostal.map((error, index) => (
                          <span key={index} className="error-text">{error}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="active"
                      checked={formData.active}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="active">
                      Usuario activo
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue">
                    {editingUser ? 'Actualizar' : 'Guardar'}
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

export default GestionUsuario;