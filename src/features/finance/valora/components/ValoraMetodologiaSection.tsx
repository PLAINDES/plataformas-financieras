export interface ValoraMetodologiaSectionProps {
  selectedMetodologiaItem: "curso" | "mercado";
  isCategoriaOpen: boolean;
  isModuloOpen: boolean;
  onToggleCategoria: () => void;
  onToggleModulo: () => void;
  onSelectCurso: () => void;
  onSelectMercado: () => void;
}

export const ValoraMetodologiaSection: React.FC<
  ValoraMetodologiaSectionProps
> = ({
  selectedMetodologiaItem,
  isCategoriaOpen,
  isModuloOpen,
  onToggleCategoria,
  onToggleModulo,
  onSelectCurso,
  onSelectMercado,
}) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Metodologia Valora</h2>
    <p className="mb-2">Aprende con nosotros paso a paso</p>
    <div className="flex lg:flex-row flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-lg">
          {selectedMetodologiaItem === "curso" ? "Curso 01" : "Mercado 01"}
        </h3>
        {selectedMetodologiaItem === "curso" ? (
          <video
            src="/video/metodologia-kapital.mp4"
            controls
            className="w-full lg:w-220 max-w-220"
          ></video>
        ) : (
          <img
            src="/images/cuales-son-tipos-finanzas.jpg"
            alt="Mercado 01"
            className="w-full lg:w-220 max-w-220"
          />
        )}
      </div>
      <div>
        <div className="mt-3 rounded border border-gray-200 bg-white">
          <h4 className="font-bold bg-blue-600 text-white p-4 px-6 text-md rounded-t">
            Aprende mas sobre el costo del capital
          </h4>
          <div>
            <div>
              <button
                type="button"
                className={`flex w-full ${isCategoriaOpen ? "text-blue-600" : "text-gray-700"} items-center justify-between rounded bg-gray-50 p-5 text-sm font-bold transition-all`}
                onClick={onToggleCategoria}
                aria-expanded={isCategoriaOpen}
              >
                Categoria 01
                <i
                  className={`fa-solid ${isCategoriaOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
                ></i>
              </button>
              <div
                className={`overflow-hidden bg-white px-5 text-sm text-gray-700 transition-all duration-300 ${isCategoriaOpen ? "max-h-20 py-5 opacity-100" : "max-h-0 py-0 opacity-0"}`}
              >
                <button
                  type="button"
                  className="w-full text-left cursor-pointer hover:text-blue-600"
                  onClick={onSelectCurso}
                >
                  Curso 01
                </button>
              </div>
            </div>
            <div>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded bg-gray-50 p-5 text-sm font-bold ${isModuloOpen ? "text-blue-600" : "text-gray-700"}`}
                onClick={onToggleModulo}
                aria-expanded={isModuloOpen}
              >
                Modulo 01
                <i
                  className={`fa-solid ${isModuloOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
                ></i>
              </button>
              <div
                className={`overflow-hidden bg-white px-5 text-sm text-gray-700 transition-all duration-300 ${isModuloOpen ? "max-h-20 py-5 opacity-100" : "max-h-0 py-0 opacity-0"}`}
              >
                <button
                  type="button"
                  className="w-full text-left cursor-pointer hover:text-blue-600"
                  onClick={onSelectMercado}
                >
                  Mercado 01
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
