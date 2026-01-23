// hooks/useCheckoutData.js
import { useState, useEffect } from 'react';
import { useUsuario } from '../../../context/userContext';
import { checkoutService } from '../services/checkoutService';

export const useCheckoutData = () => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodosEnvio, setMetodosEnvio] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { usuario } = useUsuario();

  // Cargar métodos de pago
  useEffect(() => {
    const loadMetodosPago = async () => {
      try {
        const metodos = await checkoutService.fetchMetodosPago();
        setMetodosPago(metodos);
      } catch (error) {
        console.error('Error loading payment methods:', error);
        setError('Error al cargar métodos de pago');
      }
    };
    loadMetodosPago();
  }, []);

  // Cargar métodos de envío
  useEffect(() => {
    const loadMetodosEnvio = async () => {
      try {
        const metodos = await checkoutService.fetchMetodosEnvio();
        setMetodosEnvio(metodos);
      } catch (error) {
        console.error('Error loading shipping methods:', error);
        setError('Error al cargar métodos de envío');
      }
    };
    loadMetodosEnvio();
  }, []);

  // Cargar direcciones del usuario
  useEffect(() => {
    if (!usuario?.token) return;

    const loadUserAddresses = async () => {
      try {
        const addresses = await checkoutService.fetchUserAddresses(usuario.token);
        setUserAddresses(addresses);
      } catch (error) {
        console.error('Error loading user addresses:', error);
        // No set error here as it's not critical
      }
    };
    loadUserAddresses();
  }, [usuario?.token]);

  // Cargar tarjetas del usuario
  useEffect(() => {
    if (!usuario?.token) return;

    const loadUserCards = async () => {
      try {
        const cards = await checkoutService.fetchUserCards(usuario.token);
        setUserCards(cards);
      } catch (error) {
        console.error('Error loading user cards:', error);
        // No set error here as it's not critical
      }
    };
    loadUserCards();
  }, [usuario?.token]);

  return {
    metodosPago,
    metodosEnvio,
    userCards,
    userAddresses,
    loading,
    error,
    setError
  };
};