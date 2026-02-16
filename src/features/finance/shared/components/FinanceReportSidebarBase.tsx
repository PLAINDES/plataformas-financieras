// features/finance/shared/components/FinanceReportSidebarBase.tsx

import React from 'react';

import type { ReactNode } from 'react';

export type FinanceReportSidebarBaseProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    productsSection: ReactNode;
    contentsSection: ReactNode;
    footerActions: ReactNode;
    quoteModal?: ReactNode;
    loading?: boolean;
};

export const FinanceReportSidebarBase: React.FC<FinanceReportSidebarBaseProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    productsSection,
    contentsSection,
    footerActions,
    quoteModal,
    loading = false
}) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur z-50 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={onClose}
            />
            
            {/* Sidebar Panel */}
            <div
                className={`fixed right-0 top-0 z-50 h-dvh w-full max-w-xl bg-white shadow-xl transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
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

                    {/* Body */}
                    <div className="flex flex-1 justify-center w-full overflow-hidden">
                        <div className="flex h-full w-full flex-col lg:p-6 lg:px-10 p-4 relative">
                            {/* Loading Overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <span className="text-sm font-bold text-blue-600">Procesando...</span>
                                    </div>
                                </div>
                            )}

                            {/* Title Section */}
                            <div className="mb-10 flex flex-col gap-2">
                                <h3 className="text-xl font-bold">{title}</h3>
                                <p className="text-sm w-11/12">{subtitle}</p>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto pr-2">
                                {/* Products Section */}
                                {productsSection}

                                {/* Contents Section */}
                                {contentsSection}
                            </div>

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-white px-10 pb-6 pt-4">
                                {footerActions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional Quote Modal */}
            {quoteModal}
        </>
    );
};