import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';
import Footer from '../components/footer/Footer';
import Navbar from '../components/navbar/Navbar';
import ProductCarousel from '../components/carousel/productCarousel';
import CategoryCarousel from '../components/carousel/categoriacarousel';
import BenefitsStrip from '../components/home/BenefitsStrip';
import WhatsAppButton from '../button/whatsappbutton';
import Banner from '../components/carousel/banner';
import ProductDetailModal from '../components/productos/detalleproductomodal';

const API_URL = "http://localhost:5001";

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        setProductos(res.data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      } finally {
        setLoadingProductos(false);
      }
    };
    fetchProductos();
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalOpen(false);
  };

  return (
    <div className="home-page">
      <Navbar abrirModal={openModal} />

      <div className="banner-container">
        <Banner />
      </div>

      <BenefitsStrip />

<section className="home-section bg-categories">
        <div className="container-fluid px-5">
          <div className="section-header">
            <div>
              <h2 className="sub">COMPRA POR CATEGORÍA</h2>

            </div>
          </div>
          <CategoryCarousel navigateOnClick />
        </div>
      </section>

      <section className="home-section bg-light-custom">
        <div className="container-fluid px-5">
          <div className="section-header">
            <div>
              <h2 className="sub">PRECIOS MÁS MASS</h2>

            </div>
            <Link to="/categorias" className="section-link">
              Ver catálogo
            </Link>
          </div>
          {loadingProductos ? (
            <p>Cargando productos...</p>
          ) : (
            <ProductCarousel
              products={productos}
              sortBy="price-asc"
              limit={12}
              onProductClick={openModal}
            />
          )}
        </div>
      </section>

      <div className="blue-container">
        <section className="bg-azul-personalizado py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h2>¡LOS MEJORES PRECIOS DEL BARRIO!</h2>
                <p>
                  Caser@, a mí nadie me gana, yo tengo siempre los{' '}
                  <strong>mejores precios</strong>, y además, estoy{' '}
                  <strong>cerca a tu hogar</strong>.
                </p>
                <p>¡No te pierdas los mejores precios del barrio aquí!</p>
                <Link to="/categorias" className="btn btn-light mt-3">
                  VER PRODUCTOS
                </Link>
              </div>
              <div className="col-md-6 text-center">
                <img
                  className="img-fluid"
                  src="https://www.tiendasmass.com.pe/wp-content/uploads/2023/06/mano-catalogos.webp"
                  alt="Catálogo Tiendas Mass"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="home-section bg-light-custom2">
        <div className="container-fluid px-5">
          <div className="section-header">
            <div>
              <h2 className="sub">NOVEDADES MASS</h2>
            </div>
            <Link to="/categorias" className="section-link">
              Ver novedades
            </Link>
          </div>
          {loadingProductos ? (
            <p>Cargando productos...</p>
          ) : (
            <ProductCarousel
              products={productos}
              sortBy="newest"
              limit={12}
              onProductClick={openModal}
            />
          )}
        </div>
      </section>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={closeModal}
      />

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Home;
