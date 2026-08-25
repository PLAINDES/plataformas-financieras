export interface ValoraResultsHeaderProps {
  wacc: number | null;
  title: string;
  subtitle: string;
  sector?: string;
  companyType?: "empresa" | "emergente";
  onCompanyTypeChange?: (type: "empresa" | "emergente") => void;
}

export const ValoraResultsHeader: React.FC<ValoraResultsHeaderProps> = ({
  wacc,
  title,
  subtitle,
  sector,
  companyType = "empresa",
  onCompanyTypeChange,
}) => (
  <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow p-4">
    <div className="text-left">
      <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
      {sector ? (
        <p className="text-xs font-bold text-gray-700 mt-0.5">{sector}</p>
      ) : (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>

    <div className="flex items-center gap-3">
      <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-200 whitespace-nowrap">
        WACC {wacc === null ? "-" : `${wacc.toFixed(2)}%`}
      </div>
      {onCompanyTypeChange && (
        <select
          value={companyType}
          onChange={(e) => onCompanyTypeChange(e.target.value as "empresa" | "emergente")}
          className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          aria-label="Tipo de empresa"
        >
          <option value="empresa">EMPRESA</option>
          <option value="emergente">EMERGENTE</option>
        </select>
      )}
    </div>
  </header>
);
