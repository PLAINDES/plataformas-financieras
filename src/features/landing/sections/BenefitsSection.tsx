import { useState, useEffect, useRef } from "react";
import {
  ArrowDown01,
  ArrowUp01,
  Maximize2,
  BarChart2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type {
  BenefitsSectionProps,
  IndustryData,
  YearOption,
} from "../types/benefit.types";
import { EditableText } from "@/shared/components/editable/EditableText";
import { SimpleBarChart } from "../components/SimpleBarChart";

export function BenefitsSection({ content, onSave }: BenefitsSectionProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [sortAscending, setSortAscending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [industries] = useState<string[]>([
    "Tecnología",
    "Finanzas",
    "Manufactura",
    "Comercio",
    "Servicios",
    "Construcción",
    "Agricultura",
    "Energía",
  ]);

  const [years] = useState<YearOption[]>([
    { year: 2024 },
    { year: 2023 },
    { year: 2022 },
    { year: 2021 },
    { year: 2020 },
  ]);

  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [selectedIndustryData, setSelectedIndustryData] =
    useState<IndustryData | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartModalRef = useRef<HTMLDivElement>(null);

  const generateIndustryData = (industry: string, _year: number) => {
    const data: IndustryData[] = industries.map((ind) => ({
      industry: ind,
      value: Math.random() * 15 + 5,
      label:
        ind === industry
          ? "Alto"
          : ["Alto", "Medio", "Bajo"][Math.floor(Math.random() * 3)],
    }));
    return sortAscending
      ? data.sort((a, b) => a.value - b.value)
      : data.sort((a, b) => b.value - a.value);
  };

  useEffect(() => {
    if (selectedIndustry && selectedYear) {
      setLoading(true);
      setTimeout(() => {
        const data = generateIndustryData(
          selectedIndustry,
          Number(selectedYear)
        );
        setIndustryData(data);
        setSelectedIndustryData(
          data.find((d) => d.industry === selectedIndustry) || null
        );
        setLoading(false);
      }, 500);
    }
  }, [selectedIndustry, selectedYear, sortAscending]);

  const LoadingOverlay = () => (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/75 z-10">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );

  const EmptyChart = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-gray-500">
        <BarChart2 className="w-10 h-10 mb-3 mx-auto" />
        <p className="mb-0">
          Seleccione una industria y año para ver el gráfico
        </p>
      </div>
    </div>
  );

  const IndustrySelect = ({ hidden }: { hidden?: boolean }) => (
    <select
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={selectedIndustry}
      onChange={(e) => setSelectedIndustry(e.target.value)}
    >
      <option value="" hidden>
        {hidden ? "AÑO" : "SELECCIONE UNA INDUSTRIA"}
      </option>
      {industries.map((industry, index) => (
        <option key={index} value={industry}>
          {industry}
        </option>
      ))}
    </select>
  );

  const YearSelect = ({ shortLabel }: { shortLabel?: boolean }) => (
    <select
      className="grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={selectedYear}
      onChange={(e) => setSelectedYear(Number(e.target.value))}
    >
      <option value="" hidden>
        {shortLabel ? "AÑO" : "SELECCIONE AÑO"}
      </option>
      {years.map((yearObj, index) => (
        <option key={index} value={yearObj.year}>
          {yearObj.year}
        </option>
      ))}
    </select>
  );

  const SortButton = () => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setSortAscending(!sortAscending)}
      title={sortAscending ? "Ordenar descendente" : "Ordenar ascendente"}
    >
      {sortAscending ? (
        <ArrowDown01 className="w-5 h-5" />
      ) : (
        <ArrowUp01 className="w-5 h-5" />
      )}
    </Button>
  );

  return (
    <>
      <div
        className="bs-landing-section bs-section-1 py-5 sm:py-7.5 lg:py-10"
        id="beneficios"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full lg:w-2/3">
              <div className="text-center m-4 mb-7">
                <EditableText
                  content={{
                    value: content.title,
                    id: "title",
                    type: "text",
                    section: "benefits",
                  }}
                  onSave={onSave}
                  as="h3"
                  className="fw-semibold mb-3 text-2xl"
                />
                <EditableText
                  content={{
                    value: content.subtitle,
                    id: "subtitle",
                    type: "text",
                    section: "benefits",
                  }}
                  onSave={onSave}
                  as="h3"
                  className="opacity-50 text-sm md:text-2xl px-3 py-1"
                />
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="relative p-6 sm:p-4 min-h-125 sm:min-h-100">
                  {loading && <LoadingOverlay />}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    <IndustrySelect />
                    <div className="flex gap-2">
                      <YearSelect />
                      <SortButton />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsModalOpen(true)}
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div ref={chartRef} className="w-full h-105">
                    {!selectedIndustry || !selectedYear ? (
                      <EmptyChart />
                    ) : (
                      <SimpleBarChart
                        data={industryData}
                        selectedIndustry={selectedIndustry}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-full w-screen h-screen rounded-none flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 border-b border-gray-200 shrink-0">
            <DialogTitle className="font-bold text-3xl md:text-4xl sm:text-xl">
              ¿Qué tan riesgosa es su industria?
            </DialogTitle>
            <DialogDescription className="opacity-50 text-lg md:text-2xl sm:text-sm">
              Revise el riesgo en el que se encuentra su empresa
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 p-6 overflow-y-auto relative">
            {loading && <LoadingOverlay />}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-8">
                    <IndustrySelect />
                  </div>
                  <div className="lg:col-span-4">
                    <div className="flex gap-2">
                      <YearSelect shortLabel />
                      <SortButton />
                    </div>
                  </div>
                </div>
              </div>

              {selectedIndustryData && (
                <div className="lg:col-span-4">
                  <h3 className="opacity-50 text-lg md:text-2xl mb-2">
                    Costo económico de la industria seleccionada
                  </h3>
                  <div className="flex items-center gap-3">
                    <h1 className="mb-0 text-4xl">
                      {selectedIndustryData.value.toFixed(2)}%
                    </h1>
                    <h3 className="text-blue-600 mb-0 mt-1 text-2xl">
                      {selectedIndustryData.label}
                    </h3>
                  </div>
                </div>
              )}
            </div>

            <div ref={chartModalRef} className="w-full h-155">
              {!selectedIndustry || !selectedYear ? (
                <EmptyChart />
              ) : (
                <SimpleBarChart
                  data={industryData}
                  selectedIndustry={selectedIndustry}
                  height={620}
                />
              )}
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-gray-200 shrink-0">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
