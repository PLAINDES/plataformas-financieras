// src/components/layout/Footer.tsx

import { useState, FormEvent } from 'react';
import type { Company } from '../../types';

interface FooterProps {
  company: Company;
}

export function Footer({ company }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscription = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí irá tu lógica de suscripción
    console.log('Email subscription:', email);
    setEmail('');
  };

  return (
    <footer className="mb-0">
      <div className="bs-landing-footer pt-8 pb-4">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            
            {/* Left Column - Logo & Subscription */}
            <div className="lg:col-span-4">
              {/* Logo */}
              <div className="mb-4">
                <img 
                  alt="Logo" 
                  src={`${company.host}${company.logos[2]?.patch}`}
                  className="h-[40px] object-contain"
                />
              </div>

              {/* Subscription Form */}
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-3 leading-relaxed">
                  Suscríbete para recibir actualizaciones
                </h3>
                
                <form onSubmit={handleSubscription} className="formSuscription">
                  <div className="flex gap-2">
                    <input 
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-600 bg-white/5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="tu@email.com"
                      required
                    />
                    <button 
                      type="submit"
                      className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap font-medium"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Links Grid */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* RECURSOS Column */}
                <div>
                  <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                    Recursos
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#contact" 
                        className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                      >
                        Contacto
                      </a>
                    </li>
                    {company.terms_and_conditions && (
                      <li>
                        <a 
                          href="/terminos-condiciones" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                        >
                          Términos y Condiciones
                        </a>
                      </li>
                    )}
                    {company.privacy_policies && (
                      <li>
                        <a 
                          href="/politicas-privacidad" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                        >
                          Políticas de Privacidad
                        </a>
                      </li>
                    )}
                  </ul>
                </div>

                {/* PRODUCTOS Column */}
                <div>
                  <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                    Productos
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_product_modal_1"
                        className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                      >
                        Reporte de datos
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_product_modal_2"
                        className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                      >
                        Reporte detallado
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_product_modal_3"
                        className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                      >
                        Reporte especializado
                      </a>
                    </li>
                  </ul>
                </div>

                {/* EMPRESA Column */}
                <div>
                  <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                    Empresa
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#team" 
                        className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                      >
                        Equipo
                      </a>
                    </li>
                    {company.phone_contact && (
                      <li>
                        <a 
                          href={`tel:${company.phone_contact}`}
                          className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                        >
                          {company.phone_contact}
                        </a>
                      </li>
                    )}
                    {company.email_contact && (
                      <li>
                        <a 
                          href={`mailto:${company.email_contact}`}
                          className="text-gray-300 hover:text-white text-sm transition-colors inline-block break-all"
                        >
                          {company.email_contact}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Separator */}
        <div className="container mx-auto px-4 mt-6 mb-3">
          <div className="border-t border-white/10"></div>
        </div>

        {/* Bottom Footer - Copyright & Social */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            
            {/* Copyright */}
            <div className="order-2 sm:order-1">
              <p className="text-gray-400 text-xs text-center sm:text-left">
                © {currentYear} {company.name}. Todos los derechos reservados.
              </p>
            </div>

            {/* Social Media Links */}
            <ul className="flex items-center gap-4 order-1 sm:order-2">
              {company.facebook_link && (
                <li>
                  <a 
                    href={company.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook text-lg"></i>
                  </a>
                </li>
              )}
              {company.twitter_link && (
                <li>
                  <a 
                    href={company.twitter_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter text-lg"></i>
                  </a>
                </li>
              )}
              {company.linkedin_link && (
                <li>
                  <a 
                    href={company.linkedin_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin text-lg"></i>
                  </a>
                </li>
              )}
              {company.instagram_link && (
                <li>
                  <a 
                    href={company.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram text-lg"></i>
                  </a>
                </li>
              )}
              {company.whatsapp_link && (
                <li>
                  <a 
                    href={company.whatsapp_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="WhatsApp"
                  >
                    <i className="fab fa-whatsapp text-lg"></i>
                  </a>
                </li>
              )}
            </ul>

          </div>
        </div>

      </div>

      {/* Scroll to Top Button */}
      <div 
        id="kt_scrolltop"
        className="scrolltop fixed bottom-8 right-8 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-all opacity-0 invisible z-50"
        data-kt-scrolltop="true"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z" 
            fill="currentColor" 
          />
        </svg>
      </div>
    </footer>
  );
}