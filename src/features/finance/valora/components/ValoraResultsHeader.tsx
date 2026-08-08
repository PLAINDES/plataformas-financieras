export interface ValoraResultsHeaderProps {
  wacc: number | null;
  title: string;
  subtitle: string;
  sector?: string;
}

export const ValoraResultsHeader: React.FC<ValoraResultsHeaderProps> = ({
  wacc,
  title,
  subtitle,
  sector,
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

    <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-200 whitespace-nowrap">
      WACC {wacc === null ? "-" : `${wacc.toFixed(2)}%`}
    </div>
  </header>
);
