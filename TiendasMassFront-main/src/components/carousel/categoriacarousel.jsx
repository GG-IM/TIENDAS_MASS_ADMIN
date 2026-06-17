import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../carousel/categoriacarousel.css';
import '../categoria/categoria.css';

const API_URL = "http://localhost:5001";

const CATEGORY_IMAGES = [
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat1-1.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat2.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat5.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat3.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat7.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat8.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat6.png',
  'https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/cat4.png',
];

const CategoryCarousel = ({ onSelect, navigateOnClick = false, initialCategoryId = null }) => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(initialCategoryId);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categorias`);
        const dataWithImages = res.data.map((cat, i) => ({
          ...cat,
          imagen: CATEGORY_IMAGES[i] || '/api/placeholder/120/120',
        }));
        setCategorias(dataWithImages);
      } catch (err) {
        setError('Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!initialCategoryId || categorias.length === 0) return;

    const match = categorias.find(
      (cat) => String(cat.id) === String(initialCategoryId)
    );
    if (match) {
      setActiveId(match.id);
      if (onSelect) onSelect(match);
    }
  }, [initialCategoryId, categorias, onSelect]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
    ],
  };

  const handleClick = (cat) => {
    setActiveId(cat.id);
    if (navigateOnClick) {
      navigate(`/categorias?categoriaId=${cat.id}`);
      return;
    }
    if (onSelect) onSelect(cat);
  };

  if (loading) return <p>Cargando categorías...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!categorias.length) return <p>No hay categorías para mostrar.</p>;

  return (
    <Slider {...settings}>
      {categorias.map(cat => (
        <div key={cat.id} className="slide-item">
          <div
            className={`category-card ${activeId === cat.id ? 'active' : ''}`}
            onClick={() => handleClick(cat)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClick(cat)}
          >
            <div className={`category-icon ${cat.claseColor || ''}`}>
              <img src={cat.imagen} alt={cat.nombre} />
            </div>
            <h3 className="category-name">{cat.nombre.toUpperCase()}</h3>
            
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default CategoryCarousel;
