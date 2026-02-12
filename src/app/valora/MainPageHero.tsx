import React from 'react';

type MainPageHeroProps = {
    onOpenForm: () => void;
};

export const MainPageHero: React.FC<MainPageHeroProps> = ({ onOpenForm }) => (
    <div className="flex flex-2/3 flex-col items-center justify-center py-20 px-6 bg-[#f3f6f9]">
        <div className="max-w-lg text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Bienvenido a Valora
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Completa los inputs y presionas calcular para generar resultados instantaneos
            </p>
            <button
                onClick={onOpenForm}
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                VALORA
            </button>
        </div>
    </div>
);
