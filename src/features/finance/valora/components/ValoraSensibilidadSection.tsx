import { useState } from "react";
import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraSensibilidadResultsBlock } from "./ValoraSensibilidadResultsBlock";

type TabView = "original" | "sensibility" | "comparison";

const TABS: { id: TabView; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "sensibility", label: "Sensibilidad" },
  { id: "comparison", label: "Comparación" },
];

export const ValoraSensibilidadSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>("original");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl shadow-inner border border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-valora-primary shadow-sm"
                  : "text-slate-500 hover:text-valora-primary hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "original" && (
        <ValoraGeneralResultsBlock
          onSensibilidadClick={() => setActiveTab("sensibility")}
          wacc={14}
        />
      )}

      {activeTab === "sensibility" && <ValoraSensibilidadResultsBlock />}

      {activeTab === "comparison" && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <ValoraGeneralResultsBlock wacc={14} hideButton />
          </div>
          <div className="flex-1 min-w-0">
            <ValoraSensibilidadResultsBlock />
          </div>
        </div>
      )}
    </div>
  );
};
