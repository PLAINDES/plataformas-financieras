import { Tooltip } from "@/shared/components/common/Tooltip";
import { ValoraConceptsMethodCard } from "./ValoraConceptsMethodCard";

export interface ValoraAnalisisCard {
  id: string;
  iconClassName: string;
  headerText: string;
  patrimonioValue: number;
  accionValue: number;
  activoValue: number;
  pasivoValue: number;
  patrimonioBalanceValue: number;
  valorEsperado: number;
  valorSensibilizado: number;
}

export interface ValoraAnalisisSectionProps {
  longTermGrowthRate: number;
  capitalCostRate: number;
  incomeGrowthRate: number;
  tooltipText: string;
  conceptsMethodCards: ValoraAnalisisCard[];
  onLongTermGrowthRateChange: (value: number) => void;
  onCapitalCostRateChange: (value: number) => void;
  onIncomeGrowthRateChange: (value: number) => void;
  onSaveClick?: () => void;
}

export const ValoraAnalisisSection: React.FC<ValoraAnalisisSectionProps> = ({
  longTermGrowthRate,
  capitalCostRate,
  incomeGrowthRate,
  tooltipText,
  conceptsMethodCards,
  onLongTermGrowthRateChange,
  onCapitalCostRateChange,
  onIncomeGrowthRateChange,
  onSaveClick,
}) => (
  <div className="flex flex-col w-full">
    <div className="flex lg:gap-0 gap-4 lg:flex-row flex-col w-full justify-between">
      <div className="flex flex-col p-7 justify-between bg-[#e4e6ef] shadow gap-6 lg:min-w-95">
        <p className="text-sm">Tasa de crecimiento de largo plazo (g)</p>
        <div className="relative">
          <input
            type="text"
            value={longTermGrowthRate}
            onChange={(event) =>
              onLongTermGrowthRateChange(parseFloat(event.target.value))
            }
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-center text-gray-700"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-[#666]/15 px-2 py-1 text-xs font-bold text-[#666]">
            %
          </span>
        </div>
      </div>
      <div className="flex flex-col p-7 justify-between bg-[#e4e6ef] shadow gap-6 lg:min-w-95">
        <p className="text-sm">Costo de Capital (CPPC/WACC)</p>
        <div className="relative">
          <input
            type="text"
            value={capitalCostRate}
            onChange={(event) =>
              onCapitalCostRateChange(parseFloat(event.target.value))
            }
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-center text-gray-700"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-[#666]/15 px-2 py-1 text-xs font-bold text-[#666]">
            %
          </span>
        </div>
      </div>
      <div className="flex flex-col p-7 bg-[#e4e6ef] shadow gap-6 lg:min-w-95">
        <div className="relative flex gap-2 items-center">
          <p className="text-sm">Tasa de crecimiento de los ingresos</p>
          <Tooltip
            id="valora-results-tasa-crecimiento-tooltip"
            content={tooltipText}
          >
            <button
              type="button"
              className="text-[#a1a5b7] text-lg focus-visible:outline-none"
              aria-describedby="valora-results-tasa-crecimiento-tooltip"
            >
              <i className="fa-solid fa-circle-info fs-1"></i>
            </button>
          </Tooltip>
        </div>
        <div className="relative">
          <input
            type="text"
            value={incomeGrowthRate}
            onChange={(event) =>
              onIncomeGrowthRateChange(parseFloat(event.target.value))
            }
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-center text-gray-700"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-[#666]/15 px-2 py-1 text-xs font-bold text-[#666]">
            %
          </span>
        </div>
      </div>
    </div>
    <button
      type="button"
      className="self-end my-7 rounded bg-blue-600 py-3 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-700 cursor-pointer"
      onClick={onSaveClick}
    >
      Guardar
    </button>
    <div className="flex flex-col gap-4">
      {conceptsMethodCards.map((card) => (
        <ValoraConceptsMethodCard
          key={card.id}
          iconClassName={card.iconClassName}
          headerText={card.headerText}
          patrimonioValue={card.patrimonioValue}
          accionValue={card.accionValue}
          activoValue={card.activoValue}
          pasivoValue={card.pasivoValue}
          patrimonioBalanceValue={card.patrimonioBalanceValue}
          valorEsperado={card.valorEsperado}
          valorSensibilizado={card.valorSensibilizado}
        />
      ))}
    </div>
  </div>
);
