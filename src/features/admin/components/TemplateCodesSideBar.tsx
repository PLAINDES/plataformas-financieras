import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TemplateCodeBasic } from "@/shared/types";

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
      >
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <>
          <Separator />
          <div className="p-2">{children}</div>
        </>
      )}
    </div>
  );
};

export const FieldItem: React.FC<{
  field: TemplateCodeBasic;
  largeImage?: boolean;
  onCodeClick?: (codeObj: TemplateCodeBasic) => void;
}> = ({ field, largeImage = false, onCodeClick }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", field.code);
      e.dataTransfer.effectAllowed = "copy";
    }}
    onClick={() => onCodeClick?.(field)}
    className="flex cursor-grab active:cursor-grabbing items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-blue-100 hover:bg-blue-50"
  >
    {/** show thumbnail if available */}
    {((field as any).template_code_image_url as string) && (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-blue-100 overflow-hidden">
        <img
          src={(field as any).template_code_image_url}
          alt={field.code}
          className="h-14 w-14 object-fill"
        />
      </div>
    )}
    <div className="min-w-0 flex-1">
      {largeImage ? (
        <div className="flex flex-col">
          <p className="truncate font-mono text-[10px] font-semibold text-blue-500">
            {field.code}
          </p>
          <p className="truncate text-[11px] font-bold text-slate-700">
            {field.nombre}
          </p>
          <p className="truncate text-[9px] text-slate-400">
            {field.hoja ?? "—"}
          </p>
        </div>
      ) : (
        <>
          <p className="truncate font-mono text-[11px] font-semibold text-blue-500">
            {field.code}
          </p>
          <p className="truncate text-xs font-medium text-slate-700">
            {field.nombre}
          </p>
          <p className="truncate text-[10px] text-slate-400">
            {field.hoja ?? "—"}
          </p>
        </>
      )}
    </div>
  </div>
);

interface TemplateCodesSideBarProps {
  templateCodes: TemplateCodeBasic[];
  codesLoading: boolean;
  onAddCode: (codeObj: TemplateCodeBasic) => void;
}

export const TemplateCodesSideBar: React.FC<TemplateCodesSideBarProps> = ({
  templateCodes,
  codesLoading,
  onAddCode,
}) => {
  const PAGE_SIZE = 5;
  const [fieldsPage, setFieldsPage] = useState(0);
  const [chartsPage, setChartsPage] = useState(0);
  const [fieldsQuery, setFieldsQuery] = useState("");
  const [chartsQuery, setChartsQuery] = useState("");

  // Resetea la paginación si los códigos cambian
  useEffect(() => {
    setFieldsPage(0);
    setChartsPage(0);
  }, [templateCodes]);

  const isChartOrTable = (tc: TemplateCodeBasic) => {
    const text = `${tc.nombre} ${tc.code}`.toLowerCase();
    return (
      text.includes("grafico") ||
      text.includes("gráfico") ||
      text.includes("tabla")
    );
  };

  const fields = templateCodes.filter((tc) => !isChartOrTable(tc));
  const chartsAndTables = templateCodes.filter(isChartOrTable);

  const filteredFields = fields.filter((f) =>
    !fieldsQuery
      ? true
      : `${f.code} ${f.nombre}`
          .toLowerCase()
          .includes(fieldsQuery.toLowerCase())
  );
  const filteredCharts = chartsAndTables.filter((f) =>
    !chartsQuery
      ? true
      : `${f.code} ${f.nombre}`
          .toLowerCase()
          .includes(chartsQuery.toLowerCase())
  );

  const fieldsVisible = filteredFields.slice(
    fieldsPage * PAGE_SIZE,
    (fieldsPage + 1) * PAGE_SIZE
  );
  const chartsVisible = filteredCharts.slice(
    chartsPage * PAGE_SIZE,
    (chartsPage + 1) * PAGE_SIZE
  );

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
      <p className="mb-3 text-[14px] font-bold tracking-widest text-slate-700 uppercase">
        Estructura de Tablas y Gráficos
      </p>
      <div className="flex flex-col gap-3">
        {/* Campos */}
        <CollapsiblePanel title="Campos" defaultOpen>
          <div className="px-2 pb-2">
            <Input
              value={fieldsQuery}
              onChange={(e) => setFieldsQuery(e.target.value)}
              placeholder="Buscar por código o nombre..."
              className="h-10 text-sm"
            />
          </div>
          {codesLoading ? (
            <div className="flex items-center justify-center p-6 text-sm text-slate-400">
              Cargando...
            </div>
          ) : filteredFields.length > 0 ? (
            <div className="space-y-1">
              {fieldsVisible.map((tc) => (
                <FieldItem
                  key={tc.id + tc.code}
                  field={tc}
                  onCodeClick={onAddCode}
                />
              ))}
              {filteredFields.length > PAGE_SIZE && (
                <div className="mt-2 flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setFieldsPage((p) => Math.max(0, p - 1))}
                    disabled={fieldsPage === 0}
                    className="text-xs text-slate-500 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <div className="text-xs text-slate-400">
                    {fieldsPage + 1} /{" "}
                    {Math.ceil(filteredFields.length / PAGE_SIZE)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFieldsPage((p) =>
                        Math.min(
                          Math.ceil(filteredFields.length / PAGE_SIZE) - 1,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      (fieldsPage + 1) * PAGE_SIZE >= filteredFields.length
                    }
                    className="text-xs text-slate-500 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="px-3 py-4 text-center text-[10px] text-slate-400">
              Sin campos en la plantilla.
            </p>
          )}
        </CollapsiblePanel>

        {/* Tablas / Gráficos */}
        <CollapsiblePanel title="Tablas / Gráficos" defaultOpen={false}>
          <div className="px-2 pb-2">
            <Input
              value={chartsQuery}
              onChange={(e) => setChartsQuery(e.target.value)}
              placeholder="Buscar gráficos o tablas..."
              className="h-10 text-sm"
            />
          </div>
          {codesLoading ? (
            <div className="flex items-center justify-center p-6 text-sm text-slate-400">
              Cargando...
            </div>
          ) : filteredCharts.length > 0 ? (
            <div className="space-y-1">
              {chartsVisible.map((tc) => (
                <FieldItem
                  key={tc.id + tc.code}
                  field={tc}
                  largeImage
                  onCodeClick={onAddCode}
                />
              ))}
              {filteredCharts.length > PAGE_SIZE && (
                <div className="mt-2 flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setChartsPage((p) => Math.max(0, p - 1))}
                    disabled={chartsPage === 0}
                    className="text-xs text-slate-500 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <div className="text-xs text-slate-400">
                    {chartsPage + 1} /{" "}
                    {Math.ceil(filteredCharts.length / PAGE_SIZE)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setChartsPage((p) =>
                        Math.min(
                          Math.ceil(filteredCharts.length / PAGE_SIZE) - 1,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      (chartsPage + 1) * PAGE_SIZE >= filteredCharts.length
                    }
                    className="text-xs text-slate-500 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="px-3 py-4 text-center text-[10px] text-slate-400">
              Sin elementos configurados.
            </p>
          )}
        </CollapsiblePanel>
      </div>
    </aside>
  );
};
