import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, AlertCircle } from "lucide-react";
import { useCarrito } from "../context/carContext";
import "./CheckoutPending.css";

const CheckoutPending = () => {
  const navigate = useNavigate();
  const { vaciarCarrito } = useCarrito();

  useEffect(() => {
    // 🔥 Limpiar carrito cuando se llega a página pending
    if (vaciarCarrito) {
      vaciarCarrito();
    }

    // Auto-redirect después de 8 segundos
    const timer = setTimeout(() => navigate("/"), 8000);
    return () => clearTimeout(timer);
  }, [navigate, vaciarCarrito]);

  const handleGoHome = () => navigate("/");

  return (
    <div className="checkout-pending-container">
      <div className="pending-card">
        <Clock className="pending-icon" />

        <h1 className="pending-title">Pago Pendiente</h1>

        <p className="pending-message">
          Tu pago está siendo procesado y verificado. Este proceso puede tomar algunos minutos.
        </p>

        <div className="pending-info">
          <h3>¿Qué pasa ahora?</h3>
          <ul>
            <li>✓ MercadoPago está verificando tu transacción</li>
            <li>✓ Recibirás un correo de confirmación pronto</li>
            <li>✓ Tu pedido será procesado una vez confirmado el pago</li>
            <li>✓ Si hay problemas, te contactaremos directamente</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleGoHome}>
            Ir a la Tienda
          </button>
        </div>

        <div className="help-section">
          <AlertCircle size={20} />
          <p>
            Si tienes problemas o no recibes confirmación en 24 horas, contáctanos a
            <strong> soporte@tiendasmass.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPending;
