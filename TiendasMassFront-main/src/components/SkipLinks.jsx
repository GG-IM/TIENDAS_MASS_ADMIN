// components/SkipLinks.jsx
import React from 'react';
import './SkipLinks.css';

const SkipLinks = () => {
  return (
    <nav aria-label="Enlaces de navegación rápida" className="skip-links">
      <a href="#main-content" className="skip-link">
        Ir al contenido principal
      </a>
      <a href="#navigation" className="skip-link">
        Ir a la navegación
      </a>
      <a href="#search" className="skip-link">
        Ir a la búsqueda
      </a>
      <a href="#footer" className="skip-link">
        Ir al pie de página
      </a>
    </nav>
  );
};

export default SkipLinks;