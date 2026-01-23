import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, ChevronLeft } from "lucide-react";
import { useCarrito } from "../context/carContext";
import "./CheckoutFailure.css";

const CheckoutFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vaciarCarrito } = useCarrito();
  const [errorReason, setErrorReason] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reason = query.get("reason") || "Tu pago fue rechazado o cancelado.";
    setErrorReason(reason);
  }, [location.search]);

  const handleRetry = () => navigate("/carrito");
  const handleGoHome = () => navigate("/");

  return (
    <div className="checkout-failure-container">
      <div className="failure-card">
        <XCircle className="failure-icon" />

        <h1 className="failure-title">Pago No Completado</h1>

        <p className="failure-message">{errorReason}</p>

        <div className="failure-tips">
          <h3>¿Qué puedes hacer?</h3>
          <ul>
            <li>✓ Verifica los datos de tu tarjeta</li>
            <li>✓ Asegúrate de tener saldo disponible</li>
            <li>✓ Intenta con otro método de pago</li>
            <li>✓ Contacta con tu banco si el problema persiste</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleRetry}>
            <ChevronLeft size={20} />
            Volver al Carrito
          </button>

          <button className="btn btn-secondary" onClick={handleGoHome}>
            Ir a la Tienda
          </button>
        </div>

        <p className="help-text">
          ¿Necesitas ayuda? Contáctanos en nuestro sitio o envía un correo a soporte@tiendasmass.com
        </p>
      </div>
    </div>
  );
};

export default CheckoutFailure;
