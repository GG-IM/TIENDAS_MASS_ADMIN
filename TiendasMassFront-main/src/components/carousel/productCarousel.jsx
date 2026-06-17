import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import ProductCard from '../productos/productCard';
import { useCarrito } from '../../context/carContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './productcarousel.css';

const API_URL = "http://localhost:5001";

const sortProducts = (items, sortBy) => {
  const sorted = [...items];
  if (sortBy === 'price-asc') {
    return sorted.sort((a, b) => Number(a.precio) - Number(b.precio));
  }
  if (sortBy === 'newest') {
    return sorted.sort((a, b) => {
      const dateA = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
      const dateB = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });
  }
  return sorted;
};

const ProductCarousel = ({ onProductClick, products, sortBy = 'default', limit = 12 }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(!products);
  const [error, setError] = useState(null);
  const { agregarProducto } = useCarrito();

  useEffect(() => {
    if (products) {
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        setProductos(res.data);
      } catch (err) {
        setError('Error al cargar productos.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [products]);

  const displayedProducts = useMemo(() => {
    const source = products ?? productos;
    return sortProducts(source, sortBy).slice(0, limit);
  }, [products, productos, sortBy, limit]);

  const handleAgregar = (productoConCantidad) => {
    agregarProducto(productoConCantidad);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (displayedProducts.length === 0) return <p>No hay productos para mostrar.</p>;

  return (
    <Slider {...settings}>
      {displayedProducts.map(producto => (
        <div key={producto.id} style={{ padding: '0 10px' }}>
          <ProductCard
            producto={producto}
            onAdd={handleAgregar}
            onClick={() => onProductClick && onProductClick(producto)} // Llama a la función cuando se hace clic
          />
        </div>
      ))}
    </Slider>
  );
};

export default ProductCarousel;
