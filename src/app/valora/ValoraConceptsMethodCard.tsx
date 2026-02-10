import React from 'react';

export interface ValoraConceptsMethodCardProps {
    iconClassName: string;
    headerText: string;
    patrimonioValue: number;
    accionValue: number;
    activoValue: number;
    pasivoValue: number;
    patrimonioBalanceValue: number;
    valorEsperado: number;
    valorSensibilizado: number;
}

export const ValoraConceptsMethodCard: React.FC<ValoraConceptsMethodCardProps> = ({
    iconClassName,
    headerText,
    patrimonioValue,
    accionValue,
    activoValue,
    pasivoValue,
    patrimonioBalanceValue,
    valorEsperado,
    valorSensibilizado
}) => (
    <div className='flex flex-col rounded-lg shadow'>
        <div className='flex justify-between py-4.5 rounded-t-lg px-10 bg-[#f5f8fa] w-full items-center'>
            <i className={iconClassName}></i>
            <h2 className='text-lg font-semibold'>{headerText}</h2>
            <i className="fa-solid fa-circle-info fs-1 text-[#a1a5b7] text-2xl"></i>
        </div>
        <div className='bg-white lg:px-10 px-4  p-10 pt-0 rounded-b-lg flex lg:flex-row flex-col w-full lg:gap-10'>
            <div className='flex flex-col w-full pt-10'>
                <div className='flex justify-between border-b border-gray-200 pb-5 mb-5'>
                    <h4 className='text-md font-semibold'>VALOR DEL PATRIMONIO</h4>
                    <p className='text-lg font-semibold text-green-500'>{patrimonioValue}</p>
                </div>
                <div className='flex justify-between pb-10'>
                    <h4 className='text-md font-semibold'>VALOR POR ACCION</h4>
                    <p className='text-lg font-semibold text-blue-500'>{accionValue}</p>
                </div>
            </div>
            <div className='w-full pt-5'>
                <h3 className='text-lg font-semibold pb-4 lg:pb-0'>Balance General Contable</h3>
                <div className='lg:h-11/12  w-full grid grid-rows-6 grid-cols-6 gap-1 lg:p-5 lg:px-5 px-0'>
                    <div className='relative row-span-6 justify-center items-center flex border-3 rounded-tl-lg rounded-bl-lg border-purple-800'>
                        <span className='absolute top-0 text-xs text-[#aaa]'>Activo</span>
                        <p className='text-sm'>{activoValue}</p>
                    </div>
                    <div className='row-span-4 border-3 rounded-tr-lg border-green-600 relative flex justify-center items-center'>
                        <span className='absolute top-0 text-xs text-[#aaa]'>Pasivo</span>
                        <p className='text-sm'>{pasivoValue}</p>
                    </div>
                    <div className='row-span-2 col-start-2 border-3 border-blue-400 rounded-br-lg relative flex justify-center items-center'>
                        <span className='absolute top-0 text-xs text-[#aaa]'>Patrimonio</span>
                        <p className='text-sm'>{patrimonioBalanceValue}</p>
                    </div>
                    <div className='row-start-5 col-start-3 row-span-2 border-t-2 border-b-2 border-gray-500 border-dashed'></div>
                    <div className='row-start-4 col-start-4 row-span-1 text-center text-sm'>Valor Esperado</div>
                    <div className='row-start-5 col-start-4 row-span-2 border-3 flex justify-center items-center border-blue-300 rounded-br-lg rounded-tr-lg'>
                        <p className='text-sm'>{valorEsperado}</p>
                    </div>
                    <div className='row-start-5 col-start-5 row-span-2 border-t-2 border-b-2 border-gray-500 border-dashed'></div>
                    <div className='row-start-4 col-start-6 row-span-1 text-center text-sm'>Valor Sensibilizado</div>
                    <div className='row-start-5 col-start-6 row-span-2 border-3 flex justify-center items-center border-blue-300 rounded-br-lg rounded-tr-lg'>
                        <p className='text-sm'>{valorSensibilizado}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
