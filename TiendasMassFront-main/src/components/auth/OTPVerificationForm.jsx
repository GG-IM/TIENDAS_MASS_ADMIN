// OTPVerificationForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuario } from '../../context/userContext';
import Swal from 'sweetalert2';
import './AuthStyles.css';

const API_URL = "http://localhost:5001";

function OTPVerificationForm({ email, onBackToLogin }) {
  const navigate = useNavigate();
  const { login } = useUsuario();
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(600); // 10 minutos
  const [codigoEnviado, setCodigoEnviado] = useState(true);

  // Timer para el código OTP
  useEffect(() => {
    if (tiempoRestante <= 0) {
      setCodigoEnviado(false);
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante]);

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodigoChange = (e) => {
    const valor = e.target.value.replace(/\D/g, ''); // Solo números
    if (valor.length <= 6) {
      setCodigo(valor);
    }
  };

  const handleVerificarOTP = async (e) => {
    e.preventDefault();

    if (!codigo || codigo.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Código incompleto',
        text: 'Por favor ingresa los 6 dígitos del código'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/otp/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          codigo: codigo
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Verificación exitosa
        await Swal.fire({
          icon: 'success',
          title: '¡Verificado!',
          text: 'Tu identidad ha sido confirmada',
          timer: 1500,
          showConfirmButton: false
        });

        // Guardar datos del usuario
        await login(data, false);

        // Redirigir a la página principal
        navigate('/');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Código inválido',
          text: data.error || 'El código OTP es incorrecto o ha expirado'
        });
        setCodigo('');
      }
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo verificar el código. Intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/otp/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (response.ok) {
        setTiempoRestante(600); // Reiniciar timer
        setCodigoEnviado(true);
        setCodigo('');

        Swal.fire({
          icon: 'success',
          title: 'Código reenviado',
          text: 'Se ha enviado un nuevo código a tu email',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo reenviar el código'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo reenviar el código'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Verificación en dos pasos</h2>
      <p className="otp-description">
        Se ha enviado un código de 6 dígitos a: <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerificarOTP}>
        <div className="form-group">
          <label htmlFor="otp-code">Código de verificación</label>
          <input
            id="otp-code"
            type="text"
            value={codigo}
            onChange={handleCodigoChange}
            placeholder="000000"
            maxLength="6"
            disabled={isLoading || !codigoEnviado}
            className="otp-input"
            autoFocus
          />
          <p className="otp-timer">
            Código expira en: <span className={tiempoRestante < 60 ? 'timer-warning' : ''}>
              {formatearTiempo(tiempoRestante)}
            </span>
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !codigoEnviado || codigo.length !== 6}
          className="auth-button"
        >
          {isLoading ? 'Verificando...' : 'Verificar código'}
        </button>
      </form>

      <div className="otp-actions">
        {!codigoEnviado && (
          <p className="otp-expired">El código ha expirado</p>
        )}
        <button
          type="button"
          onClick={handleReenviarCodigo}
          disabled={isLoading || codigoEnviado && tiempoRestante > 300} // No reenviable hasta 5 min después
          className="link-button"
        >
          Reenviar código
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          disabled={isLoading}
          className="link-button"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}

export default OTPVerificationForm;
