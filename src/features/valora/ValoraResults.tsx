import React, { useState } from 'react';
import { ValoraAnalisisSection } from './ValoraAnalisisSection';
import { ValoraEstadosSection } from './ValoraEstadosSection';
import { ValoraMetodologiaSection } from './ValoraMetodologiaSection';
import { ValoraResultadosSection } from './ValoraResultadosSection';
import type { FinancialTable, FormData } from '../../types/ValoraTypes';
import type { ValoraResultsSection } from './ValoraResultsTabs';

export interface ValoraResultsProps {
    formData: FormData;
    section: ValoraResultsSection;
    balanceTable: FinancialTable | null;
    resultsTable: FinancialTable | null;
}

export const ValoraResults: React.FC<ValoraResultsProps> = ({
    section,
    balanceTable,
    resultsTable
}) => {
    const [financialTab, setFinancialTab] = useState<'balance' | 'results'>('balance');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [longTermGrowthRate, setLongTermGrowthRate] = useState(1.50);
    const [capitalCostRate, setCapitalCostRate] = useState(12.43);
    const [incomeGrowthRate, setIncomeGrowthRate] = useState(0.00);
    const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
    const [isModuloOpen, setIsModuloOpen] = useState(false);
    const [selectedMetodologiaItem, setSelectedMetodologiaItem] = useState<'curso' | 'mercado'>('curso');
    const companies = ['Empresa Alfa', 'Empresa Beta', 'Empresa Gamma', 'Empresa Delta'];
    const conceptsMethodCards = [
        {
            id: 'conceptos',
            iconClassName: 'fa-solid fa-chart-pie fs-1 text-[#a1a5b7] text-2xl',
            headerText: 'MÉTODO POR CONCEPTOS',
            patrimonioValue: 0,
            accionValue: 0,
            activoValue: 0,
            pasivoValue: 0,
            patrimonioBalanceValue: 0,
            valorEsperado: 0,
            valorSensibilizado: 0
        },
        {
            id: 'integrado',
            iconClassName: 'fa-solid fa-chart-simple fs-1 text-[#a1a5b7] text-2xl',
            headerText: 'MÉTODO INTEGRADO',
            patrimonioValue: 0,
            accionValue: 0,
            activoValue: 0,
            pasivoValue: 0,
            patrimonioBalanceValue: 0,
            valorEsperado: 0,
            valorSensibilizado: 0
        }
    ];
    const conceptosData = [
        {
            id: 'conceptos',
            headerText: 'MÉTODO POR CONCEPTOS',
            tooltipText: 'Mediante este metodo, VALORA realiza la proyeccion de cada componente del Flujo de Caja Economico (FCE).',
            iconClassName: 'fa-solid fa-triangle-exclamation fs-1 text-[#a1a5b7] text-2xl',
            patrimonioValue: 0,
            empresaValue: 0,
            accionValue: 0,
            activoValue: 13408303,
            pasivoValue: 13408303,
            patrimonioBalanceValue: 13408303,
            valorFinancieroPatrimonio: null
        },
        {
            id: 'INTEGRADO',
            headerText: 'MÉTODO INTEGRADO',
            tooltipText: 'Mediante este método, VALORA realiza una proyección del flujo de caja operativo de forma histórica, complementándola con la proyección de las inversiones y la variación en el capital de trabajo para obtener el FCE proyectado.',
            iconClassName: 'fa-solid fa-chart-pie fs-1 text-[#a1a5b7] text-2xl',
            patrimonioValue: 0,
            empresaValue: 0,
            accionValue: 0,
            activoValue: 13408303,
            pasivoValue: 13408303,
            patrimonioBalanceValue: 13408303,
            valorFinancieroPatrimonio: null
        }
    ];

    const mainLabelsForFinancialTables = ['TOTAL ACTIVOS', 'TOTAL PASIVOS', 'TOTAL PASIVOS Y PATRIMONIO', 'Utilidad Bruta', 'Utilidad Operativa', 'Utilidad antes de impuesto a la renta', 'Utilidad neta'];

    const tooltipText = 'Defina la tasa de crecimiento de los ingresos para el primer año de proyección. La tasa por defecto es la recomendada por la plataforma.';

    const formatCell = (value: string | number | null) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        if (typeof value === 'number') {
            return value.toLocaleString('es-PE');
        }
        return String(value);
    };

    const renderTable = (table: FinancialTable | null) => {
        if (!table) {
            return (
                <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    Carga el archivo para ver la tabla.
                </div>
            );
        }

        return (
            <div className="overflow-x-auto rounded border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#f5f8fa] text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold border border-gray-100">{table.title}</th>
                            {table.years.map(year => (
                                <th key={year} className="px-4 py-3 text-right font-bold border border-gray-100">
                                    {year}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="border-y border-gray-200">
                        {table.rows.map((row, rowIndex) => (
                            <tr key={`${row.label}-${rowIndex}`}>
                                <td className={`px-4 py-2 text-left border border-gray-100 ${mainLabelsForFinancialTables.includes(row.label) ? 'font-bold bg-blue-600/10 text-blue-600' : 'text-gray-700'}`}>{row.label}</td>
                                {row.values.map((value, valueIndex) => (
                                    <td key={`${row.label}-${rowIndex}-${valueIndex}`} className="px-4 py-2 text-right text-gray-700 border border-gray-100">
                                        {formatCell(value)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSelectedCompany(e.target.value);
    };


    return (
        <div className="flex-12 flex flex-col w-full h-full lg:pb-10 py-10 lg:pt-10 bg-[#f3f6f9] min-h-dvh">
            <div className="flex-1 w-full px-4 sm:px-8">
                <div className="mx-auto flex w-full max-w-300 flex-col gap-6">

                    {section === 'resultados' && (
                        <ValoraResultadosSection
                            conceptosData={conceptosData}
                            companies={companies}
                            selectedCompany={selectedCompany}
                            onCompanyChange={handleCompanyChange}
                        />
                    )}

                    {section === 'estados' && (
                        <ValoraEstadosSection
                            financialTab={financialTab}
                            onTabChange={setFinancialTab}
                            renderTable={renderTable}
                            balanceTable={balanceTable}
                            resultsTable={resultsTable}
                        />
                    )}

                    {section === 'analisis' && (
                        <ValoraAnalisisSection
                            longTermGrowthRate={longTermGrowthRate}
                            capitalCostRate={capitalCostRate}
                            incomeGrowthRate={incomeGrowthRate}
                            tooltipText={tooltipText}
                            conceptsMethodCards={conceptsMethodCards}
                            onLongTermGrowthRateChange={setLongTermGrowthRate}
                            onCapitalCostRateChange={setCapitalCostRate}
                            onIncomeGrowthRateChange={setIncomeGrowthRate}
                        />
                    )}

                    {section === 'metodologia' && (
                        <ValoraMetodologiaSection
                            selectedMetodologiaItem={selectedMetodologiaItem}
                            isCategoriaOpen={isCategoriaOpen}
                            isModuloOpen={isModuloOpen}
                            onToggleCategoria={() => setIsCategoriaOpen(open => !open)}
                            onToggleModulo={() => setIsModuloOpen(open => !open)}
                            onSelectCurso={() => setSelectedMetodologiaItem('curso')}
                            onSelectMercado={() => setSelectedMetodologiaItem('mercado')}
                        />
                    )}

                </div>
            </div >
        </div >
    );
};
