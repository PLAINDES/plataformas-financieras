import { useEffect, useMemo, useState } from "react";
import { FormField } from "../../components/FormField";
import { ExternalLink, Info } from "lucide-react";
import { MainService } from "@/shared/services/main.service";

const formatNumber = (value: number | null | undefined, decimals = 2) => {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

type BvlCotizacionItem = {
  empresa: string;
  id: string;
  numero_acciones: number | null;
  capitalizacion_bursatil: number | null;
  valor_por_accion: number | null;
};

export const ValoraBVLBox: React.FC = () => {
  const [companies, setCompanies] = useState<BvlCotizacionItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    MainService.getBvlCotizacion()
      .then((res) => {
        if (cancelled) return;
        const items = res.items || [];
        setCompanies(items);
        if (items.length > 0 && !selectedCompany) {
          setSelectedCompany(items[0].empresa);
        }
      })
      .catch(() => {
        setCompanies([]);
      })
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedCompany]);

  const selected = useMemo(
    () => companies.find((c) => c.empresa === selectedCompany),
    [companies, selectedCompany]
  );

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSelectedCompany(e.target.value);
  };

  return (
    <div className="flex flex-col rounded-lg shadow overflow-hidden bg-[#f1faff]">
      <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200">
        <ExternalLink className="h-5 w-5 text-[#a1a5b7]" />
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
          Cotización en la BVL
        </h2>
        <Info className="h-5 w-5 text-[#a1a5b7]" />
      </div>
      <div className="px-4 py-3 flex flex-col lg:flex-row lg:gap-6 gap-3">
        <div className="flex flex-col w-full lg:w-1/3">
          <label className="text-xs font-bold text-gray-700 mb-1">Empresa</label>
          <FormField
            label=""
            name="currency"
            type="select"
            value={selectedCompany}
            options={companies.map((c) => c.empresa)}
            onChange={handleCompanyChange}
            showClearButton={false}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col w-full lg:w-2/3 gap-2 justify-center">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-600">
              PRECIO POR ACCIÓN
            </span>
            <span className="text-base font-bold text-green-500">
              {formatNumber(selected?.valor_por_accion)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600">
              CAPITALIZACIÓN BURSÁTIL
            </span>
            <span className="text-base font-bold text-blue-500">
              {formatNumber(selected?.capitalizacion_bursatil)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
