import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './AuthStyles.css';
import { validateRegisterForm } from '../../utils/validators';

const API_URL = "http://localhost:5001";

function RegisterForm({ switchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar el error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const validationErrors = validateRegisterForm(formData);
    
    // Si hay errores de validación, mostrarlos en rojo debajo de cada campo
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email.trim().toLowerCase(), // ✅ Normalizar email
          password: formData.password,
          direccion: formData.address || ""

        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ahora puedes iniciar sesión',
          confirmButtonText: 'OK'
        }).then(() => {
          switchToLogin(); // Redirige al login después de cerrar el alert
        });
      } else {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message || 'Error al registrarse',
      });
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al conectar con el servidor',
      });
    }
  };


  return (
    <div className="form-container">
      <h2 className="form-title">Crear Cuenta</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ingresa tu nombre"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && (
            <div className="error-messages">
              {errors.name.map((error, index) => (
                <span key={index} className="error-text">{error}</span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="ejemplo@correo.com"
            className={errors.email ? 'input-error' : ''}
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
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="********"
            className={errors.password ? 'input-error' : ''}
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
          <label htmlFor="register-confirmPassword">Confirmar contraseña</label>
          <input
            id="register-confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="********"
            className={errors.confirmPassword ? 'input-error' : ''}
          />
          {errors.confirmPassword && (
            <div className="error-messages">
              {errors.confirmPassword.map((error, index) => (
                <span key={index} className="error-text">{error}</span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Registrarse
        </button>

        <div className="form-footer">
          <p>
            ¿Ya tienes cuenta?
            <button
              type="button"
              onClick={switchToLogin}
              className="switch-form-button"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;