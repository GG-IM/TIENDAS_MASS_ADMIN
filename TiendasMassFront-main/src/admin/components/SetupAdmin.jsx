import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield, FaSave, FaCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './SetupAdmin.css';
import { validateUserForm, validateField } from '../../utils/usuariosvalidaciones';
const API_URL = "http://localhost:5000";
const SetupAdmin = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Verificar estado del sistema al cargar
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/setup/status`);
      const data = await response.json();
      
      setNeedsSetup(data.needsSetup);
      setCheckingSetup(false);

      if (!data.needsSetup) {
        Swal.fire({
          icon: 'info',
          title: 'Sistema ya configurado',
          text: 'El sistema ya tiene un administrador. Serás redirigido al login.',
          timer: 3000,
          showConfirmButton: false
        });
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error al verificar estado del sistema:', error);
      setCheckingSetup(false);
      setNeedsSetup(true); // Asumir que necesita setup si hay error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en tiempo real
    const error = validateField(name, value, formData);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    // Usar el validador completo de usuarios con rol fijo 'Administrador'
    const formDataWithRole = { ...formData, rol: 'Administrador' };
    const errors = validateUserForm(formDataWithRole);
    
    setFieldErrors(errors);
    
    // Si hay errores, solo retornar false (los errores se muestran en rojo debajo de cada campo)
    if (Object.keys(errors).length > 0) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const userData = {
        ...formData
      };

      // Remover confirmPassword del objeto
      delete userData.confirmPassword;

      const response = await fetch(`${API_URL}/api/setup/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Administrador Creado Exitosamente!',
          text: `El administrador ${formData.nombre} ha sido creado. Ahora puedes iniciar sesión.`,
          confirmButtonText: 'Ir al Login'
        }).then(() => {
          navigate('/admin');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al Crear Administrador',
          text: data.error || 'No se pudo crear el administrador',
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    } catch (error) {
      console.error('Error al crear administrador:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonText: 'Intentar de nuevo'
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="setup-loading">
        <div className="loading-spinner"></div>
        <p>Verificando estado del sistema...</p>
      </div>
    );
  }

  if (!needsSetup) {
    return null; // Será redirigido por el useEffect
  }

  return (
    <div className="setup-admin-container">
      <div className="setup-admin-card">
        <div className="setup-admin-header">
          <div className="setup-icon">
            <FaUserShield />
          </div>
          <h1>Configuración Inicial</h1>
          <p>Bienvenido a Tiendas Mass. Necesitamos crear el primer administrador del sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                <FaUser className="input-icon" />
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                required
                className={`form-input ${fieldErrors.nombre ? 'is-invalid' : ''}`}
              />
              {fieldErrors.nombre && (
                <div className="invalid-feedback">{fieldErrors.nombre}</div>
              )}
              <small className="form-text">2-100 caracteres, solo letras y espacios</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@tiendamass.com"
                required
                className={`form-input ${fieldErrors.email ? 'is-invalid' : ''}`}
              />
              {fieldErrors.email && (
                <div className="invalid-feedback">{fieldErrors.email}</div>
              )}
              <small className="form-text">Máximo 254 caracteres, formato válido</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Contraseña *
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className={`form-input ${fieldErrors.password ? 'is-invalid' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="invalid-feedback">{fieldErrors.password}</div>
              )}
              <small className="form-text">8-128 caracteres, mayúsculas, minúsculas, números y símbolos</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="input-icon" />
                Confirmar Contraseña *
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className={`form-input ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>
              )}
              <small className="form-text">Debe coincidir con la contraseña</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">
                <FaUser className="input-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+51 999 999 999"
                className={`form-input ${fieldErrors.telefono ? 'is-invalid' : ''}`}
              />
              {fieldErrors.telefono && (
                <div className="invalid-feedback">{fieldErrors.telefono}</div>
              )}
              <small className="form-text">7-15 caracteres, solo números y +</small>
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">
                <FaUser className="input-icon" />
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Lima"
                className={`form-input ${fieldErrors.ciudad ? 'is-invalid' : ''}`}
              />
              {fieldErrors.ciudad && (
                <div className="invalid-feedback">{fieldErrors.ciudad}</div>
              )}
              <small className="form-text">2-100 caracteres, solo letras y espacios</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">
              <FaUser className="input-icon" />
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Av. Principal 123"
              className={`form-input ${fieldErrors.direccion ? 'is-invalid' : ''}`}
            />
            {fieldErrors.direccion && (
              <div className="invalid-feedback">{fieldErrors.direccion}</div>
            )}
            <small className="form-text">5-200 caracteres alfanuméricos</small>
          </div>

          <div className="form-group">
            <label htmlFor="codigoPostal">
              <FaUser className="input-icon" />
              Código Postal
            </label>
            <input
              type="text"
              id="codigoPostal"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleInputChange}
              placeholder="15001"
              className={`form-input ${fieldErrors.codigoPostal ? 'is-invalid' : ''}`}
            />
            {fieldErrors.codigoPostal && (
              <div className="invalid-feedback">{fieldErrors.codigoPostal}</div>
            )}
            <small className="form-text">4-10 caracteres alfanuméricos</small>
          </div>

          <div className="setup-actions">
            <button
              type="submit"
              className="setup-button"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Creando...' : 'Crear Administrador'}
            </button>
          </div>
        </form>

        <div className="setup-footer">
          <div className="setup-info">
            <FaCheck className="info-icon" />
            <div>
              <h4>¿Qué se creará?</h4>
              <ul>
                <li>Rol de Administrador</li>
                <li>Estado "Activo" para usuarios</li>
                <li>Primer usuario administrador</li>
                <li>Acceso completo al sistema</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupAdmin; 