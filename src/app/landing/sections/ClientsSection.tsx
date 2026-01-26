// src/app/landing/sections/ClientsSection.tsx

import type { ClientLogo } from "../../../types/landing.types";

interface ClientsSectionProps {
  clients: ClientLogo[];
}

export function ClientsSection({ clients }: ClientsSectionProps) {
  if (!clients || clients.length === 0) {
    return null;
  }

  return (
    <div className="bs-section-2 text-secondary" >
      <div className="container">
        {/* Title */}
        <div className="text-center mb-4 mb-md-5">
          <h2 className="text-secondary mb-0 fw-normal  fs-5 fs-md-3 fs-lg-3 ">
            Ellos confiaron en nosotros
          </h2>
        </div>

        {/* Clients Grid - Responsive */}
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-5 px-3 px-md-5">

          {clients.map((client) => (
             <div
                key={client.id}
                className="d-flex justify-content-center align-items-center"
                style={{ minWidth: '70px', maxWidth: '140px' }}
                title={client.name}
              >
              <img
                src={client.imageUrl}
                alt={client.alt || client.name}
                className="client-logo img-fluid"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 768px) {
          .bs-section-2 .mh-lg-35px {
            max-height: 35px !important;
          }
        }

        @media (max-width: 767px) {
          .bs-section-2 {
            padding: 30px 0;
          }
          
          .bs-section-2 .container {
            padding: 0 15px;
          }
          
          .bs-section-2 img {
            max-height: 25px !important;
          }
        }

        @media (max-width: 575px) {
          .bs-section-2 {
            padding: 25px 0;
          }
          
          .bs-section-2 h2 {
            font-size: 1.25rem !important;
          }
          
          .bs-section-2 img {
            max-height: 22px !important;
          }
          
          .bs-section-2 .d-flex.flex-wrap {
            gap: 1rem !important;
          }
        }

        /* Hover effect para desktop */
        @media (hover: hover) {
          .bs-section-2 img:hover {
            transform: scale(1.1);
          }
        }

        
.bs-section-2 {
  padding: 40px 0;
  color: #adb5bd; /* gris claro bootstrap */
}

/* Texto */
.bs-section-2 h2 {
  color: #adb5bd;
}

/* Logos */
.bs-section-2 .client-logo {
  max-height: 30px;
  width: auto;
  object-fit: contain;
  filter: grayscale(100%) brightness(0.85);
  opacity: 0.4;
  transition: all 0.3s ease;
}

/* Hover solo en desktop */
@media (hover: hover) {
  .bs-section-2 .client-logo:hover {
    filter: grayscale(0%) brightness(1);
    opacity: 0.6;
    transform: scale(1.08);
  }
}

/* Tablet */
@media (min-width: 768px) {
  .bs-section-2 .client-logo {
    max-height: 35px;
  }
}

/* Mobile */
@media (max-width: 575px) {
  .bs-section-2 {
    padding: 25px 0;
  }

  .bs-section-2 h2 {
    font-size: 1.25rem;
  }

  .bs-section-2 .client-logo {
    max-height: 22px;
  }
}

      `}</style>
    </div>
  );
}