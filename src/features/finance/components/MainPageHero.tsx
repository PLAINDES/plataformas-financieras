import React from 'react';
import { Calculator, FileText } from 'lucide-react';

type MainPageHeroProps = {
    title: string;
    buttonText: string;
    onOpenForm: () => void;
};

export const MainPageHero: React.FC<MainPageHeroProps> = ({ 
    title, 
    buttonText, 
    onOpenForm 
}) => (
    <div className="flex flex-2/3 flex-col items-center justify-center py-20 px-6 bg-[#f3f6f9]">
        <div className="max-w-lg text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Calculator className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl 2xl:text-3xl font-bold text-gray-900 mb-3">
                {title}
            </h2>

            <p className="text-gray-600 leading-relaxed mb-6">
                Completa los inputs y presionas calcular para generar resultados instantaneos
            </p>

            <button
                onClick={onOpenForm}
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition-all"
            >
                <FileText className="w-5 h-5" />
                {buttonText}
            </button>
        </div>
    </div>
);