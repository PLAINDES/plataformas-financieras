import React, { useState } from 'react';

import { ReportCheckbox } from './ReportCheckbox';
import { ReportProductCard } from './ReportProductCard';
import { ReportQuoteModal } from './ReportQuoteModal';

export type ReportProduct = {
    id: string;
    title: string;
    iconClassName: string;
};

export type ReportSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
    reportProducts: ReportProduct[];
    selectedReportProductId: string;
    onSelectReportProduct: (id: string) => void;
    onOpenReportViewer: () => void;
};

export const ReportSidebar: React.FC<ReportSidebarProps> = ({
    isOpen,
    onClose,
    reportProducts,
    selectedReportProductId,
    onSelectReportProduct,
    onOpenReportViewer
}) => {
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteEmail, setQuoteEmail] = useState('');
    const [quotePhone, setQuotePhone] = useState('');
    const [quoteMessage, setQuoteMessage] = useState('');

    const handleQuoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-30 bg-black/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <div
                className={`fixed right-0 top-0 z-40 h-dvh w-full max-w-xl bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-end border-b border-gray-200 p-5">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={onClose}
                            aria-label="Cerrar reporte"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className='flex justify-center w-full'>
                        <div className='lg:p-6 lg:px-10 p-4'>
                            <div className="mb-10 flex flex-col gap-2">
                                <h3 className="text-xl font-semibold">
                                    Genera un reporte con tus datos
                                </h3>
                                <p className='text-sm w-11/12'>Identifica el costo de capital al que se enfrenta tu empresa, proyecto o inversion.</p>
                            </div>
                            <h4 className='text-lg font-semibold'>Seleccione el producto de su preferencia:</h4>
                            <div className='flex gap-4 my-12 lg:justify-start justify-center'>
                                {reportProducts.map(product => (
                                    <ReportProductCard
                                        key={product.id}
                                        title={product.title}
                                        iconClassName={product.iconClassName}
                                        selected={selectedReportProductId === product.id}
                                        onSelect={() => onSelectReportProduct(product.id)}
                                    />
                                ))}
                            </div>
                            <h4 className='text-lg font-semibold'>Contenido:</h4>
                            <div className="flex flex-col gap-3 p-10 py-8">
                                <ReportCheckbox name="contenido-1" label="Costo de capital del sector" />
                                <ReportCheckbox name="contenido-2" label="Costo de capital de la empresa" />
                                <ReportCheckbox name="contenido-3" label="Metodologia explicada" />
                                <ReportCheckbox name="contenido-4" label="1 hora de consultoria" />
                            </div>
                            <div className='flex flex-col justify-center px-10 pb-20 pt-10'>
                                <button
                                    type="button"
                                    className='bg-[#009ef7] hover:bg-[#007acc] transition-colors px-4 py-2 rounded text-white uppercase font-medium w-full text-sm cursor-pointer'
                                    onClick={onOpenReportViewer}
                                >
                                    Generar reporte
                                </button>
                                <button
                                    type="button"
                                    className='bg-gray-200 hover:bg-gray-300 transition-colors px-4 py-2 rounded text-gray-700 uppercase font-medium w-full mt-2 text-sm cursor-pointer'
                                    onClick={() => setIsQuoteModalOpen(true)}
                                >
                                    Cotizar consultoria
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ReportQuoteModal
                isOpen={isQuoteModalOpen}
                email={quoteEmail}
                phone={quotePhone}
                message={quoteMessage}
                onClose={() => setIsQuoteModalOpen(false)}
                onEmailChange={setQuoteEmail}
                onPhoneChange={setQuotePhone}
                onMessageChange={setQuoteMessage}
                onSubmit={handleQuoteSubmit}
            />
        </>
    );
};
