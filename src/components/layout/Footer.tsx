// src/components/layout/Footer.tsx

import type { Company } from '../../types'

interface FooterProps {
  company: Company;
}

export function Footer({ company }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bs-landing-footer">
      <div className="container py-5">
        <div className="row">
          <div className="col-md-6">
            <img 
              src={`${company.host}${company.logos[0].patch}`} 
              alt={company.name}
              className="h-50px mb-3"
            />
            <p className="text-white-50">
              {company.name} - Plataforma de Finanzas
            </p>
          </div>
          
          <div className="col-md-6 text-md-end">
            <p className="text-white-50 mb-0">
              © {currentYear} {company.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}