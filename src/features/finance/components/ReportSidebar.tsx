import { useState, useRef } from "react";

import { ReportCheckbox } from "./ReportCheckbox";
import { ReportProductCard } from "./ReportProductCard";
import { ReportQuoteModal } from "./ReportQuoteModal";

export type ReportProduct = {
  id: string;
  title: string;
  iconClassName: string;
};

export type ReportSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  reportProducts: ReportProduct[];
  selectedReportProductId: string;
  onSelectReportProduct: (id: string) => void;
  onOpenReportViewer: () => void;
};

export const ReportSidebar: React.FC<ReportSidebarProps> = ({
  isOpen,
  onClose,
  reportProducts,
  selectedReportProductId,
  onSelectReportProduct,
  onOpenReportViewer,
}) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");

  // Refs para controlar el drag-to-scroll sin provocar re-renders
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false); // Diferencia entre clic normal y arrastre

  const handleQuoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  // --- Funciones para el Drag-to-Scroll ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false; // Reiniciamos el estado de arrastre al hacer clic
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    hasDragged.current = true; // Si el ratón se mueve mientras está presionado, es un arrastre
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur z-100 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        className={`fixed right-0 top-0 z-130 h-dvh w-full max-w-xl bg-white shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-end border-b border-gray-200 p-5">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
              aria-label="Cerrar reporte"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="flex flex-1 justify-center w-full overflow-hidden">
            <div className="flex h-full w-full flex-col lg:p-6 lg:px-10 p-4">
              <div className="mb-10 flex flex-col gap-2">
                <h3 className="text-xl font-bold">
                  Genera un reporte con tus datos
                </h3>
                <p className="text-sm w-11/12">
                  Identifica el costo de capital al que se enfrenta tu empresa,
                  proyecto o inversion.
                </p>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                <h4 className="text-lg font-bold">
                  Seleccione el producto de su preferencia:
                </h4>
                {/* Contenedor del Drag-to-Scroll */}
                <div
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="flex gap-4 my-6 lg:justify-start justify-start overflow-x-auto cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
                >
                  {reportProducts.map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0"
                      onClickCapture={(e) => {
                        // Si el usuario arrastró, evitamos que el clic seleccione la tarjeta
                        if (hasDragged.current) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <ReportProductCard
                        title={product.title}
                        iconClassName={product.iconClassName}
                        selected={selectedReportProductId === product.id}
                        onSelect={() => {
                          if (!hasDragged.current) {
                            onSelectReportProduct(product.id);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                <h4 className="text-lg font-bold">Contenido:</h4>
                <div className="flex flex-col gap-3 p-10 py-8">
                  <ReportCheckbox
                    name="contenido-1"
                    label="Costo de capital del sector"
                  />
                  <ReportCheckbox
                    name="contenido-2"
                    label="Costo de capital de la empresa"
                  />
                  <ReportCheckbox
                    name="contenido-3"
                    label="Metodologia explicada"
                  />
                  <ReportCheckbox
                    name="contenido-4"
                    label="1 hora de consultoria"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white px-10 pb-6 pt-4">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded text-white uppercase font-medium w-full text-sm cursor-pointer"
                  onClick={onOpenReportViewer}
                >
                  Generar reporte
                </button>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 transition-colors px-4 py-2 rounded text-gray-700 uppercase font-medium w-full mt-2 text-sm cursor-pointer"
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  Cotizar consultoria
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReportQuoteModal
        isOpen={isQuoteModalOpen}
        email={quoteEmail}
        phone={quotePhone}
        message={quoteMessage}
        onClose={() => setIsQuoteModalOpen(false)}
        onEmailChange={setQuoteEmail}
        onPhoneChange={setQuotePhone}
        onMessageChange={setQuoteMessage}
        onSubmit={handleQuoteSubmit}
      />
    </>
  );
};
