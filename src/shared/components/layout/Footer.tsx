import { useState } from "react";
import type { FormEvent } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Company } from "../../types";

interface FooterProps {
  company: Company;
}

export function Footer({ company }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscription = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail("");
  };

  const socialLinks = [
    {
      href: company.facebook_link,
      icon: <Facebook size={18} />,
      label: "Facebook",
    },
    {
      href: company.twitter_link,
      icon: <Twitter size={18} />,
      label: "Twitter",
    },
    {
      href: company.linkedin_link,
      icon: <Linkedin size={18} />,
      label: "LinkedIn",
    },
    {
      href: company.instagram_link,
      icon: <Instagram size={18} />,
      label: "Instagram",
    },
    {
      href: company.whatsapp_link,
      icon: (
        <svg
          viewBox="0 0 256 259"
          width="18"
          height="18"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
          fill="currentColor"
        >
          <path d="m67.663 221.823 4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.61 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-10.464Z" />
          <path d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.898 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.688 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986Z" />
        </svg>
      ),
      label: "WhatsApp",
    },
  ];

  return (
    <footer className="mb-0">
      <div className="bs-landing-footer pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="mb-4">
                <img
                  alt="Logo"
                  src={`images/logo.png`}
                  className="h-10 object-contain"
                />
              </div>

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
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium whitespace-nowrap"
                    >
                      Enviar
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

                <div>
                  <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                    Productos
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Reporte de datos",
                      "Reporte detallado",
                      "Reporte especializado",
                    ].map((label, i) => (
                      <li key={i}>
                        <a
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target={`#kt_product_modal_${i + 1}`}
                          className="text-gray-300 hover:text-white text-sm transition-colors inline-block"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

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

        <div className="container mx-auto px-4 mt-6 mb-3">
          <div className="border-t border-white/10" />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 text-xs text-center sm:text-left order-2 sm:order-1">
              © {currentYear} {company.name}. Todos los derechos reservados.
            </p>

            <ul className="flex items-center gap-4 order-1 sm:order-2">
              {socialLinks.map(({ href, icon, label }) =>
                href ? (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={label}
                    >
                      {icon}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>
      </div>

      <Button
        size="icon"
        className="fixed bottom-8 right-8 w-11 h-11 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg z-50 opacity-0 invisible"
        id="kt_scrolltop"
        data-kt-scrolltop="true"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
      >
        <ChevronUp className="text-white" size={20} />
      </Button>
    </footer>
  );
}
