import React from 'react';

import { MobileCurrentPage } from './MobileCurrentPage';
import { ValoraFormPanel } from './ValoraFormPanel';
import { ValoraResultsTabs } from './ValoraResultsTabs';
import type { FormData } from '../../types/ValoraTypes';

type ValoraMobileLayoutProps = {
    activePanel: 'menu' | 'form' | 'options' | null;
    lastPanel: 'menu' | 'form' | 'options';
    showResults: boolean;
    resultsSection: 'estados' | 'resultados' | 'analisis' | 'metodologia';
    onTogglePanel: (panel: 'menu' | 'form' | 'options') => void;
    onClosePanel: () => void;
    onChangeResultsSection: (section: 'estados' | 'resultados' | 'analisis' | 'metodologia') => void;
    onOpenReportSidebar: () => void;
    formData: FormData;
    dates: string[];
    countries: string[];
    currencies: string[];
    sectors: string[];
    fileUploaded: boolean;
    uploadedFileUrl: string | null;
    onClearUploadedFile: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onDownloadTemplate: () => void;
    onUploadTemplate: () => void;
    currentMobilePage: React.ReactNode;
    isFormToggleDisabled?: boolean;
};

export const ValoraMobileLayout: React.FC<ValoraMobileLayoutProps> = ({
    activePanel,
    lastPanel,
    showResults,
    resultsSection,
    onTogglePanel,
    onClosePanel,
    onChangeResultsSection,
    onOpenReportSidebar,
    formData,
    dates,
    countries,
    currencies,
    sectors,
    fileUploaded,
    uploadedFileUrl,
    onClearUploadedFile,
    onInputChange,
    onSubmit,
    onDownloadTemplate,
    onUploadTemplate,
    currentMobilePage,
    isFormToggleDisabled = false
}) => (
    <div className='w-full h-dvh flex flex-col'>
        <ul id='header-valora-responsive' className='flex items-center justify-between w-full p-3 shadow-xs px-8 text-[#009ef7] border-b border-gray-200'>
            <li className='flex flex-row gap-5'>
                <button
                    type="button"
                    className="group p-2 rounded transition-colors duration-200 cursor-pointer :disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Abrir opciones"
                    disabled={isFormToggleDisabled}
                    onClick={() => !isFormToggleDisabled && onTogglePanel('form')}
                >
                    <i className="fa-solid rounded p-2 fa-rectangle-list transition-colors duration-200 group-hover:bg-[#A1A5B755]"></i>
                </button>
                {
                    showResults &&
                    <button
                        type="button"
                        className="group p-2 rounded transition-colors duration-200 cursor-pointer"
                        aria-label="Abrir menu"
                        onClick={() => onTogglePanel('options')}
                    >
                        <i className="fa-solid rounded p-2 fa-align-justify transition-colors duration-200 group-hover:bg-[#A1A5B755]"></i>
                    </button>
                }
            </li>
            <li>
                <div className="flex items-center gap-2">
                    {showResults && (
                        <button
                            type="button"
                            className="group p-2 rounded transition-colors duration-200 cursor-pointer"
                            aria-label="Generar reporte"
                            onClick={onOpenReportSidebar}
                        >
                            <i className="fa-solid rounded p-2 fa-file-lines transition-colors duration-200 group-hover:bg-[#A1A5B755]"></i>
                        </button>
                    )}
                    <button
                        type="button"
                        className="group p-2 rounded transition-colors duration-200 cursor-pointer"
                        aria-label="Abrir formulario"
                        onClick={() => onTogglePanel('menu')}
                    >
                        <i className="fa-solid rounded p-2 fa-user transition-colors duration-200 group-hover:bg-[#A1A5B755]"></i>
                    </button>
                </div>
            </li>
        </ul>

        {activePanel && (
            <div
                className="fixed inset-0 z-40 bg-black/40"
                onClick={onClosePanel}
            />
        )}

        <div
            className={` overflow-auto fixed top-0 left-0 z-50 h-full ${lastPanel === 'menu' ? 'w-1/3 max-w-30' : 'w-11/12 max-w-100'}  bg-white shadow-xs-lg transition-transform duration-200 ${activePanel ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="absolute right-0 top-0 p-4">
                <button
                    type="button"
                    className=" text-gray-500 bg-white hover:bg-gray-100 rounded-md px-3 py-1 shadow transition-colors cursor-pointer"
                    aria-label="Cerrar panel"
                    onClick={onClosePanel}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="px-4 pt-6 h-full">
                {activePanel === 'menu' && (
                    <div className='flex flex-col gap-8 justify-between items-center h-full py-10'>
                        <div className='flex flex-col gap-8'>
                            <a href="/valora" className='self-center'>
                                <img src="/images/logo-valora-small.png" width={24} />
                            </a>
                            <button className='text-[#009ef7] p-1.5 bg-[#f2f5f8] rounded-md self-center'>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor"></rect>
                                    <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="currentColor"></rect>
                                    <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="currentColor"></rect>
                                    <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="currentColor"></rect>
                                </svg>
                            </button>
                        </div>
                        <a href="#" className='self-center text-[#A1A5B7]'>
                            <i className='fa-solid fa-arrow-right-to-bracket me-1 text-[25px]'></i>
                        </a>
                    </div>
                )}

                {activePanel === 'form' && (
                    <ValoraFormPanel
                        formData={formData}
                        dates={dates}
                        countries={countries}
                        currencies={currencies}
                        sectors={sectors}
                        fileUploaded={fileUploaded}
                        uploadedFileUrl={uploadedFileUrl}
                        onClearUploadedFile={onClearUploadedFile}
                        onInputChange={onInputChange}
                        onSubmit={onSubmit}
                        onDownloadTemplate={onDownloadTemplate}
                        onUploadTemplate={onUploadTemplate}
                    />
                )}

                {activePanel === 'options' && (
                    <div className="flex flex-col gap-4 pt-8">
                        {showResults ? (
                            <ValoraResultsTabs
                                orientation="vertical"
                                activeSection={resultsSection}
                                onChange={section => {
                                    onChangeResultsSection(section);
                                    onClosePanel();
                                }}
                            />
                        ) : (
                            <p className="text-sm text-gray-600">
                                Genera resultados para ver las opciones disponibles.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
        <MobileCurrentPage>
            {currentMobilePage}
        </MobileCurrentPage>
    </div>
);
