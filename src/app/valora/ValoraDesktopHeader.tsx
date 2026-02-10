import React from 'react';

import { ValoraFormPanel } from './ValoraFormPanel';
import type { FormData } from '../../types/ValoraTypes';

type ValoraDesktopHeaderProps = {
    headerRef: React.RefObject<HTMLElement>;
    isDesktopFormOpen: boolean;
    onToggleDesktopForm: () => void;
    isFormToggleDisabled?: boolean;
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
};

export const ValoraDesktopHeader: React.FC<ValoraDesktopHeaderProps> = ({
    headerRef,
    isDesktopFormOpen,
    onToggleDesktopForm,
    isFormToggleDisabled = false,
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
    onUploadTemplate
}) => (
    <header
        id='header-valora'
        ref={headerRef}
        className='fixed left-0 top-0 flex h-dvh bg-white z-20'
    >
        <div className='flex flex-col justify-between h-full border-r border-gray-200 p-8 z-40 bg-white'>
            <div className=' flex flex-col gap-8'>
                <a href="/valora" className='self-center'>
                    <img src="/images/logo-valora-small.png" width={24} />
                </a>
                <button
                    type="button"
                    className={`text-[#009ef7] p-1.5 bg-[#f2f5f8] rounded-md ${isFormToggleDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    aria-label="Abrir formulario"
                    title="Formulario"
                    onClick={isFormToggleDisabled ? undefined : onToggleDesktopForm}
                    disabled={isFormToggleDisabled}
                >
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
            <div className="absolute -right-4 top-20 z-50">
                <button
                    type="button"
                    className={`shadow-xs bg-white text-[#666] transition-colors p-2 rounded text-sm ${isFormToggleDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#009ef7] hover:text-white'}`}
                    aria-label="manejar formulario"
                    onClick={isFormToggleDisabled ? undefined : onToggleDesktopForm}
                    disabled={isFormToggleDisabled}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: isDesktopFormOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                            transformOrigin: '50% 50%',
                            width: '20px',
                            height: '20px',
                            transition: 'transform 100ms'
                        }}
                    >
                        <rect opacity="0.5" x="6" y="11" width="13" height="2" rx="1" fill="currentColor"></rect>
                        <path d="M8.56569 11.4343L12.75 7.25C13.1642 6.83579 13.1642 6.16421 12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75L5.70711 11.2929C5.31658 11.6834 5.31658 12.3166 5.70711 12.7071L11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25C13.1642 17.8358 13.1642 17.1642 12.75 16.75L8.56569 12.5657C8.25327 12.2533 8.25327 11.7467 8.56569 11.4343Z" fill="currentColor"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div
            className={`h-full transition-[width] duration-200 ${isDesktopFormOpen ? 'w-105' : 'w-0'}`}
        >
            <div
                className={`h-full w-105 bg-white shadow-xs transition-transform duration-200 ${isDesktopFormOpen ? 'translate-x-0' : '-translate-x-105'}`}
            >
                <div className="p-3 h-full overflow-y-auto">
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
                </div>
            </div>
        </div>
    </header>
);
