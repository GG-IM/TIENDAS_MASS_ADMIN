import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useCarrito } from "../context/carContext";
import "./CheckoutSuccess.css";

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vaciarCarrito } = useCarrito();
  const [status, setStatus] = useState("Verificando pago...");
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("loading"); // loading, success, pending, error
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentId = query.get("payment_id");

    if (!paymentId) {
      setStatus("No se encontró payment_id en la URL.");
      setPaymentStatus("error");
      return;
    }

    const confirmarPago = async () => {
      try {
        const resp = await fetch(
          `http://localhost:5001/api/payments/mp/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              preferenceId: paymentId // Enviar como preferenceId
            }),
          }
        );

        const data = await resp.json();
        if (resp.ok) {
          if (data.statusMp === "approved") {
            setStatus("¡Pago aprobado exitosamente!");
            setPaymentStatus("success");
            // 🔥 Limpiar carrito después de pago exitoso
            if (vaciarCarrito) {
              vaciarCarrito();
            }
          } else if (data.statusMp === "pending") {
            setStatus("Pago pendiente de verificación");
            setPaymentStatus("pending");
          } else {
            setStatus(`Pago: ${data.statusMp}`);
            setPaymentStatus("pending");
          }
          setOrderId(data.orderId);
        } else {
          setStatus("Error al confirmar el pago. Intenta más tarde.");
          setPaymentStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("Error de conexión al confirmar el pago.");
        setPaymentStatus("error");
      }
    };

    confirmarPago();
  }, [location.search]);

  // Auto-redirect después de 5 segundos
  useEffect(() => {
    if (paymentStatus === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && paymentStatus === "success") {
      navigate("/");
    }
  }, [countdown, paymentStatus, navigate]);

  const handleGoHome = () => navigate("/");

  const renderIcon = () => {
    if (paymentStatus === "success") {
      return <CheckCircle className="icon success-icon" />;
    } else if (paymentStatus === "pending") {
      return <Clock className="icon pending-icon" />;
    } else {
      return <AlertCircle className="icon error-icon" />;
    }
  };

  return (
    <div className="checkout-success-container">
      <div className="success-card">
        {renderIcon()}

        <h1 className="success-title">
          {paymentStatus === "success"
            ? "¡Compra Completada!"
            : paymentStatus === "pending"
            ? "Pago Pendiente"
            : "Error en la Transacción"}
        </h1>

        <p className="success-message">{status}</p>

        {orderId && (
          <div className="order-info">
            <p className="order-label">ID de Pedido:</p>
            <p className="order-id">{orderId}</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="redirect-info">
            <p className="countdown-text">
              Redirigiendo en <span className="countdown">{countdown}</span> segundos...
            </p>
          </div>
        )}

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleGoHome}>
            {paymentStatus === "success" ? "Ir a la tienda" : "Volver a la tienda"}
          </button>

          {paymentStatus === "pending" && (
            <p className="info-text">
              Tu pago está siendo verificado. Te enviaremos un correo cuando sea confirmado.
            </p>
          )}

          {paymentStatus === "error" && (
            <p className="error-text">
              Si el problema persiste, contáctanos o intenta nuevamente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
