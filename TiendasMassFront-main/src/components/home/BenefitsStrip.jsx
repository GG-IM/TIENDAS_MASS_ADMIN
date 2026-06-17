import React from 'react';
import './BenefitsStrip.css';

const benefits = [
  {
    icon: 'bi-tag-fill', // Puedes mantener los iconos de Bootstrap
    title: 'Mejores precios',
    description: 'Los precios más Mass del barrio, todos los días.',
  },
  {
    icon: 'bi-geo-alt-fill',
    title: 'Cerca de ti',
    description: 'Tiendas Mass a pocos minutos de tu hogar.',
  },
  {
    icon: 'bi-shield-check',
    title: 'Pago seguro',
    description: 'Compra con confianza usando Mercado Pago.',
  },
  {
    icon: 'bi-whatsapp',
    title: 'Atención rápida',
    description: 'Escríbenos por WhatsApp y te ayudamos al toque.',
  },
];

const BenefitsStrip = () => (
  <section className="benefits-strip" aria-label="Beneficios de Tiendas Mass">
    <div className="container">
      {/* NUEVO: Título agregado aquí */}
      <h2 className="benefits-title text-center">Beneficios del Barrio</h2>
      
      <div className="benefits-grid">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="benefit-item">
            <div className="benefit-icon" aria-hidden="true">
              <i className={`bi ${benefit.icon}`}></i>
            </div>
            <div className="benefit-text">
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsStrip;