import React from 'react';

import { FormField } from '../../shared/components/FormField';
import { ResultsConceptsCard } from './ResultsConceptsCard';

export interface ValoraResultadosSectionProps {
    conceptosData: Array<{
        id: string;
        headerText: string;
        tooltipText: string;
        iconClassName: string;
        patrimonioValue: number;
        empresaValue: number;
        accionValue: number;
        activoValue: number;
        pasivoValue: number;
        patrimonioBalanceValue: number;
        valorFinancieroPatrimonio: number | null;
    }>;
    companies: string[];
    selectedCompany: string;
    onCompanyChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ValoraResultadosSection: React.FC<ValoraResultadosSectionProps> = ({
    conceptosData,
    companies,
    selectedCompany,
    onCompanyChange
}) => (
    <div className="flex flex-col gap-6 ">
        {conceptosData.map(concepto => (
            <ResultsConceptsCard
                key={concepto.id}
                headerText={concepto.headerText}
                tooltipText={concepto.tooltipText}
                iconClassName={concepto.iconClassName}
                patrimonioValue={concepto.patrimonioValue}
                empresaValue={concepto.empresaValue}
                accionValue={concepto.accionValue}
                activoValue={concepto.activoValue}
                pasivoValue={concepto.pasivoValue}
                patrimonioBalanceValue={concepto.patrimonioBalanceValue}
                valorFinancieroPatrimonio={concepto.valorFinancieroPatrimonio}
            />
        ))}
        <div className='flex flex-col rounded-lg shadow'>
            <div className='flex justify-between py-4.5 rounded-t-lg px-10 bg-[#f1faff] w-full border-b border-gray-200 items-center'>
                <i className="fa-solid fa-arrow-up-right-from-square fs-1 text-[#a1a5b7] text-2xl"></i>
                <h2 className='text-lg font-bold'>COTIZACION EN BVL</h2>
                <i className="fa-solid fa-circle-info fs-1 text-[#a1a5b7] text-2xl"></i>
            </div>
            <div className='bg-[#f1faff] lg:px-10 px-4 p-10 pt-0 rounded-b-lg flex lg:flex-row flex-col w-full lg:gap-10'>
                <div className='flex flex-col w-full mt-5'>
                    <h4 className='text-sm font-bold mb-2'>Empresa</h4>
                    <FormField
                        label=""
                        name="currency"
                        type="select"
                        value={selectedCompany}
                        options={companies}
                        onChange={onCompanyChange}
                    />
                </div>
                <div className='w-full  mt-5'>
                    <div className='flex justify-between pb-5 mb-5 border-b border-gray-200'>
                        <h4 className='text-md font-bold'>VALOR POR ACCION</h4>
                        <p className='text-lg font-bold text-green-500'>0</p>
                    </div>
                    <div className='flex justify-between pb-10'>
                        <h4 className='text-md font-bold'>CAPITALIZACION BURSATIL</h4>
                        <p className='text-lg font-bold text-blue-500'>0</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
