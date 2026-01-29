import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import './AuthStyles.css';
import { validateRegisterForm } from '../../utils/validators';

const API_URL = "http://localhost:5001";

function RegisterForm({ switchToLogin }) {
  const [tiposCliente, setTiposCliente] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',


    // ✅ dinámico desde BD
    tipoClienteId: '',

    // Persona (para NATURAL y también puedes usarlo como representante en JURIDICO)
    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',

    // Empresa (solo JURIDICO)
    ruc: '',
    razonSocial: '',
    nombreComercial: ''
  });

  const [errors, setErrors] = useState({});


  // ---------------------------
  // 1) Cargar tipos desde BD
  // ---------------------------
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tipos-cliente`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.message || 'No se pudo cargar tipos de cliente');

        setTiposCliente(Array.isArray(data) ? data : []);
        // ✅ Seleccionar por defecto el primero
        if (Array.isArray(data) && data.length > 0) {
          setFormData(prev => ({ ...prev, tipoClienteId: String(data[0].id) }));
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar TipoCliente desde el servidor'
        });
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTipos();
  }, []);

  // Saber si es NATURAL o JURIDICO a partir del id
  const tipoSeleccionado = useMemo(() => {
    return tiposCliente.find(t => String(t.id) === String(formData.tipoClienteId));
  }, [tiposCliente, formData.tipoClienteId]);

  const esJuridico = (tipoSeleccionado?.nombre || '').toUpperCase() === 'JURIDICO';
  const esNatural = (tipoSeleccionado?.nombre || '').toUpperCase() === 'NATURAL';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const basicFrontChecks = () => {
    // Tus validaciones actuales
    const validationErrors = validateRegisterForm(formData);

    // ✅ Validaciones mínimas extra según tipo
    const extra = { ...validationErrors };

    if (!formData.tipoClienteId) {
      extra.tipoClienteId = ['Selecciona el tipo de cliente'];
    }

    if (esNatural) {
      if (!formData.dni || formData.dni.length !== 8) {
        extra.dni = [...(extra.dni || []), 'DNI debe tener 8 dígitos'];
      }
      if (!formData.nombres) {
        extra.nombres = [...(extra.nombres || []), 'Nombres es obligatorio'];
      }
      if (!formData.apellidoPaterno) {
        extra.apellidoPaterno = [...(extra.apellidoPaterno || []), 'Apellido paterno es obligatorio'];
      }
    }

    if (esJuridico) {
      if (!formData.ruc || formData.ruc.length !== 11) {
        extra.ruc = [...(extra.ruc || []), 'RUC debe tener 11 dígitos'];
      }
      if (!formData.razonSocial) {
        extra.razonSocial = [...(extra.razonSocial || []), 'Razón social es obligatoria'];
      }
      // para jurídico igual pedimos un contacto mínimo
      if (!formData.nombres) {
        extra.nombres = [...(extra.nombres || []), 'Nombre del contacto es obligatorio'];
      }
    }

    return extra;
  };


const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = basicFrontChecks();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    try {
      const payload = {
        // lo actual (usuario)
        nombre: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        direccion: formData.address || "",

        // ✅ nuevo: tipoClienteId (desde BD)
        tipoClienteId: Number(formData.tipoClienteId),

        // Persona
        persona: {
          tipoDocumento: "DNI",
          numeroDocumento: esNatural ? formData.dni : formData.dni || "", // si en jurídico quieres DNI del representante
          nombres: formData.nombres || formData.name,
          apellidoPaterno: formData.apellidoPaterno || "",
          apellidoMaterno: formData.apellidoMaterno || "",
          correo: formData.email.trim().toLowerCase(),
          telefono: formData.telefono || ""
        },

        // Empresa solo si es jurídico
        empresa: esJuridico ? {
          ruc: formData.ruc,
          razonSocial: formData.razonSocial,
          nombreComercial: formData.nombreComercial || "",
          correo: formData.email.trim().toLowerCase(),
          telefono: formData.telefono || ""
        } : null
      };

      const response = await fetch(`${API_URL}/api/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ahora puedes iniciar sesión',
          confirmButtonText: 'OK'
        }).then(() => switchToLogin());
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error al registrarse'
        });
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al conectar con el servidor'
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
          <label className="field-label">Tipo de cliente</label>

          <div className={`select-wrap ${errors.tipoClienteId ? 'is-error' : ''} ${loadingTipos ? 'is-disabled' : ''}`}>
            <select
              name="tipoClienteId"
              value={formData.tipoClienteId}
              onChange={handleInputChange}
              disabled={loadingTipos}
              className="select-control"
            >
              {tiposCliente.length === 0 && (
                <option value="">Sin tipos disponibles</option>
              )}

              {tiposCliente.map(t => (
                <option key={t.id} value={String(t.id)}>
                  {t.nombre}
                </option>
              ))}
            </select>

            <span className="select-chevron">⌄</span>
          </div>

          {errors.tipoClienteId && (
            <div className="error-messages">
              {errors.tipoClienteId.map((error, index) => (
                <span key={index} className="error-text">{error}</span>
              ))}
            </div>
          )}
        </div>


        {/* ✅ Campos NATURAL */}
        {esNatural && (
          <>
            <div className="form-group">
              <label>DNI</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                placeholder="8 dígitos"
                className={errors.dni ? 'input-error' : ''}
              />
              {errors.dni && (
                <div className="error-messages">
                  {errors.dni.map((error, index) => (
                    <span key={index} className="error-text">{error}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Nombres</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className={errors.nombres ? 'input-error' : ''}
              />
              {errors.nombres && (
                <div className="error-messages">
                  {errors.nombres.map((error, index) => (
                    <span key={index} className="error-text">{error}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Apellido paterno</label>
              <input
                type="text"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleInputChange}
                className={errors.apellidoPaterno ? 'input-error' : ''}
              />
              {errors.apellidoPaterno && (
                <div className="error-messages">
                  {errors.apellidoPaterno.map((error, index) => (
                    <span key={index} className="error-text">{error}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Apellido materno</label>
              <input
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {/* ✅ Campos JURIDICO */}
        {esJuridico && (
          <>
            <div className="form-group">
              <label>RUC</label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleInputChange}
                placeholder="11 dígitos"
                className={errors.ruc ? 'input-error' : ''}
              />
              {errors.ruc && (
                <div className="error-messages">
                  {errors.ruc.map((error, index) => (
                    <span key={index} className="error-text">{error}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Razón social</label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleInputChange}
                className={errors.razonSocial ? 'input-error' : ''}
              />
              {errors.razonSocial && (
                <div className="error-messages">
                  {errors.razonSocial.map((error, index) => (
                    <span key={index} className="error-text">{error}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Nombre comercial (opcional)</label>
              <input
                type="text"
                name="nombreComercial"
                value={formData.nombreComercial}
                onChange={handleInputChange}
              />
            </div>

            {/* Contacto mínimo */}
            <div className="form-group">
              <label>Nombre del contacto</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className={errors.nombres ? 'input-error' : ''}
              />
              {errors.nombres && (
                <div className="error-messages">
                  {errors.nombres.map((error, index) => (
                    <span key={index} className="error-text">{error}</span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Teléfono (opcional)</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
          />
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