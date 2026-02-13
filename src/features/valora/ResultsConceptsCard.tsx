import React from 'react';

import { Tooltip } from '../../components/common/Tooltip';

export interface ResultsConceptsCardProps {
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
}

const formatNumber = (value: number | null) => {
    if (value === null) {
        return 'null';
    }

    return value.toLocaleString('es-PE');
};

export const ResultsConceptsCard: React.FC<ResultsConceptsCardProps> = ({
    headerText,
    tooltipText,
    iconClassName,
    patrimonioValue,
    empresaValue,
    accionValue,
    activoValue,
    pasivoValue,
    patrimonioBalanceValue,
    valorFinancieroPatrimonio
}) => (
    <div className='flex flex-col rounded-lg shadow'>
        <div className='flex justify-between py-4.5 rounded-t-lg px-10 bg-[#f5f8fa] w-full items-center'>
            <i className={iconClassName}></i>
            <h2 className='text-lg font-bold'>{headerText}</h2>
            <Tooltip
                id="valora-results-tooltip"
                content={tooltipText}
            >
                <button
                    type="button"
                    className="text-[#a1a5b7] text-2xl focus-visible:outline-none"
                    aria-describedby="valora-results-tooltip"
                >
                    <i className="fa-solid fa-circle-info fs-1"></i>
                </button>
            </Tooltip>
        </div>
        <div className='bg-white lg:px-10 px-4  p-10 pt-0 rounded-b-lg flex lg:flex-row flex-col w-full lg:gap-10'>
            <div className='flex flex-col w-full pt-10'>
                <div className='flex justify-between border-b border-gray-200 pb-10 mb-10'>
                    <h4 className='text-md font-bold'>VALOR DEL PATRIMONIO</h4>
                    <p className='text-lg font-bold text-green-500'>{formatNumber(patrimonioValue)}</p>
                </div>
                <div className='flex justify-between border-b border-gray-200 pb-10 mb-10'>
                    <h4 className='text-md font-bold'>VALOR DE EMPRESA</h4>
                    <p className='text-lg font-bold text-red-500'>{formatNumber(empresaValue)}</p>
                </div>
                <div className='flex justify-between pb-10'>
                    <h4 className='text-md font-bold'>VALOR POR ACCION</h4>
                    <p className='text-lg font-bold text-blue-500'>{formatNumber(accionValue)}</p>
                </div>
            </div>
            <div className='w-full pt-5'>
                <h3 className='text-lg font-bold pb-4 lg:pb-0'>Balance General Contable</h3>
                <div className='lg:h-11/12  w-full grid grid-rows-6 grid-cols-4 gap-1 lg:p-5 lg:px-5 px-0'>
                    <div className='relative row-span-6 justify-center items-center flex border-3 rounded-tl-lg rounded-bl-lg border-purple-800'>
                        <span className='absolute top-0 text-xs text-[#aaa]'>Activo</span>
                        <p className='text-sm'>{formatNumber(activoValue)}</p>
                    </div>
                    <div className='row-span-4 border-3 rounded-tr-lg border-green-600 relative flex justify-center items-center'>
                        <span className='absolute top-0 text-xs text-[#aaa]'>Pasivo</span>
                        <p className='text-sm'>{formatNumber(pasivoValue)}</p>
                    </div>
                    <div className='row-span-2 col-start-2 border-3 border-blue-400 rounded-br-lg relative flex justify-center items-center'>
                        <span className='absolute top-0 text-xs text-[#aaa]'>Patrimonio</span>
                        <p className='text-sm'>{formatNumber(patrimonioBalanceValue)}</p>
                    </div>
                    <div className='row-start-5 col-start-3 row-span-2 border-t-2 border-b-2 border-gray-500 border-dashed'></div>
                    <div className='row-start-4 col-start-4 row-span-1 text-center text-sm'>Valor Financiero del Patrimonio</div>
                    <div className='row-start-5 col-start-4 row-span-2 border-3 flex justify-center items-center border-blue-300 rounded-br-lg rounded-tr-lg'>
                        <p className='text-sm'>{formatNumber(valorFinancieroPatrimonio)}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
