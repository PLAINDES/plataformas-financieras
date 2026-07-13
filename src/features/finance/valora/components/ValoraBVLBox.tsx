import { useState } from "react";
import { FormField } from "../../components/FormField";
import { ExternalLink, Info } from "lucide-react";

const formatNumber = (value: number, decimals = 2) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const ValoraBVLBox: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState("Alicorp");
  const companies = ["Alicorp", "Empresa Alfa", "Empresa Beta", "Empresa Gamma"];

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSelectedCompany(e.target.value);
  };

  return (
    <div className="flex flex-col rounded-lg shadow overflow-hidden bg-[#f1faff]">
      <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
        <ExternalLink className="h-6 w-6 text-[#a1a5b7]" />
        <h2 className="text-base sm:text-lg font-bold text-gray-800 uppercase tracking-tight">
          Cotización en la BVL
        </h2>
        <Info className="h-6 w-6 text-[#a1a5b7]" />
      </div>
      <div className="px-6 py-6 flex flex-col lg:flex-row lg:gap-10 gap-6">
        <div className="flex flex-col w-full lg:w-1/3">
          <label className="text-sm font-bold text-gray-700 mb-2">Empresa</label>
          <FormField
            label=""
            name="currency"
            type="select"
            value={selectedCompany}
            options={companies}
            onChange={handleCompanyChange}
            showClearButton={false}
          />
        </div>
        <div className="flex flex-col w-full lg:w-2/3 gap-4 justify-center">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <span className="text-sm font-bold text-gray-600">
              PRECIO POR ACCIÓN
            </span>
            <span className="text-lg font-bold text-green-500">
              {formatNumber(7.05, 2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600">
              CAPITALIZACIÓN BURSÁTIL
            </span>
            <span className="text-lg font-bold text-blue-500">
              {formatNumber(5972701703.55, 2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
