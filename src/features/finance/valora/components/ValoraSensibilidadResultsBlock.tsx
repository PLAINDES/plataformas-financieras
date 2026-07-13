import { BarChart3, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraMethodSummaryCard } from "./ValoraMethodSummaryCard";

const formatNumber = (value: number, decimals = 0) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const ValueBox = ({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) => (
  <div className="flex-1 border-[3px] border-blue-300 rounded-xl p-6 flex flex-col items-center justify-center bg-blue-50/30">
    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
      {label}
    </span>
    <span className={`text-2xl sm:text-3xl font-bold mt-2 ${colorClass}`}>
      {formatNumber(value)}
    </span>
  </div>
);

export const ValoraSensibilidadResultsBlock: React.FC = () => (
  <div className="flex flex-col gap-6">
    <ValoraResultsHeader
      wacc={10.5}
      title="Sensibilidad"
      subtitle="Resultados sensibilizados"
      hideButton
    />

    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/3 flex flex-col gap-6">
        <ValoraMethodSummaryCard
          icon={PieChart}
          headerText="Método por Conceptos"
          empresaValue={2259768}
          patrimonioValue={14056078}
          accionValue={22.6}
        />
        <ValoraMethodSummaryCard
          icon={BarChart3}
          headerText="Método Integrado"
          empresaValue={2285958}
          patrimonioValue={15045999}
          accionValue={22.86}
        />
      </div>

      <div className="lg:w-2/3">
        <div className="flex flex-col rounded-lg shadow bg-white overflow-hidden h-full">
          <div className="flex items-center justify-center py-4 px-6 bg-[#f5f8fa]">
            <h2 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight">
              Valoración Sensibilizada
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-6 flex-1 justify-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <ValueBox
                label="Valor Esperado"
                value={2259768}
                colorClass="text-blue-600"
              />
              <ValueBox
                label="Valor Sensibilizado"
                value={2612926}
                colorClass="text-valora-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Crecimiento forecast ingresos
                </span>
                <span className="text-sm font-bold text-gray-800">8.50%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Crecimiento forecast perpetuo
                </span>
                <span className="text-sm font-bold text-gray-800">3.00%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  WACC
                </span>
                <span className="text-sm font-bold text-gray-800">10.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
