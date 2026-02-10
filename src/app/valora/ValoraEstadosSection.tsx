import React from 'react';

import type { FinancialTable } from '../../types/ValoraTypes';

export interface ValoraEstadosSectionProps {
    financialTab: 'balance' | 'results';
    onTabChange: (tab: 'balance' | 'results') => void;
    onUploadClick?: () => void;
    renderTable: (table: FinancialTable | null) => React.ReactNode;
    balanceTable: FinancialTable | null;
    resultsTable: FinancialTable | null;
}

export const ValoraEstadosSection: React.FC<ValoraEstadosSectionProps> = ({
    financialTab,
    onTabChange,
    onUploadClick,
    renderTable,
    balanceTable,
    resultsTable
}) => (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-md shadow">
        <div className='flex justify-between'>
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${financialTab === 'balance'
                        ? 'border-[#009ef7] text-[#009ef7] bg-[#009ef7]/5'
                        : 'border-gray-200 text-gray-600 hover:border-[#009ef7]'}`}
                    onClick={() => onTabChange('balance')}
                >
                    Estado de Situacion Financiera
                </button>
                <button
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${financialTab === 'results'
                        ? 'border-[#009ef7] text-[#009ef7] bg-[#009ef7]/5'
                        : 'border-gray-200 text-gray-600 hover:border-[#009ef7]'}`}
                    onClick={() => onTabChange('results')}
                >
                    Estado de Resultados
                </button>
            </div>
            <div>
                <button
                    type="button"
                    className="flex gap-2 items-center w-full rounded bg-[#009ef7] py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-600 cursor-pointer"
                    onClick={onUploadClick}
                >
                    <i className="fa-solid fa-file-import"></i>
                    Subir Archivo
                </button>
            </div>
        </div>
        {financialTab === 'balance' ? renderTable(balanceTable) : renderTable(resultsTable)}
    </div>
);
