import React from 'react';

export const MainPageHero: React.FC = () => (
    <>
        <div className="w-full bg-white shadow-xs self-start md:min-h-17" />
        <div className="flex-2/3 w-full flex justify-center items-center lg:items-start pt-10 sm:pt-14 lg:pt-20 bg-[#f3f6f9] px-4 sm:px-8">
            <div className="w-full max-w-240 flex justify-center flex-col items-center gap-4 p-6 sm:p-10 lg:px-30 border border-gray-300 bg-[#e1f5fe]">
                <i className="fa-solid fa-calculator text-primary text-5xl sm:text-6xl lg:text-7xl text-[#009ef7]"></i>
                <h2 className="text-xl sm:text-2xl lg:text-[27px] font-semibold text-center">
                    Completa los inputs y presionas calcular para generar resultados instantaneos
                </h2>
                <button
                    className="rounded bg-sky-500 py-2 px-10 sm:px-16 text-md font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
                    disabled
                >
                    VALORA
                </button>
            </div>
        </div>
    </>
);
