import React from 'react';

import { IconActionButton } from './IconActionButton';
import { FormField } from './FormField';
import type { FormData } from '../../types/ValoraTypes';

export interface ValoraFormPanelProps {
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
}

export const ValoraFormPanel: React.FC<ValoraFormPanelProps> = ({
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
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="bg-white p-2 pt-4 lg:pt-16">
            <div className="flex items-center gap-2 border-b border-gray-100 py-6 pt-0 ">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">1</span>
                <h3 className="text-lg font-semibold text-gray-800">Ingrese inputs de su pais</h3>
            </div>
            <div className="mt-8 flex flex-col gap-5">
                <FormField
                    label="Fecha"
                    name="date"
                    type="select"
                    value={formData.date}
                    options={dates}
                    required
                    onChange={onInputChange}
                />
                <FormField
                    label="Pais"
                    name="country"
                    type="select"
                    value={formData.country}
                    options={countries}
                    required
                    onChange={onInputChange}
                />
                <FormField
                    label="Moneda"
                    name="currency"
                    type="select"
                    value={formData.currency}
                    options={currencies}
                    required
                    onChange={onInputChange}
                />
                <FormField
                    label="Sector"
                    name="sector"
                    type="select"
                    value={formData.sector}
                    options={sectors}
                    required
                    onChange={onInputChange}
                />
            </div>

            <div className="mt-6 flex items-center gap-2 border-b border-gray-100 pt-0 py-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">2</span>
                <h3 className="text-lg font-semibold text-gray-800">Ingrese inputs de su empresa</h3>
            </div>

            <div className="mt-8 flex flex-col gap-5">
                <div className="flex w-full justify-between">
                    <label className="text-sm text-gray-600 md:col-span-8 font-semibold">Descargar plantilla EEFF</label>
                    <div className="md:col-span-4 md:flex md:justify-end">
                        <IconActionButton
                            iconClassName="fa-solid fa-download"
                            ariaLabel="Descargar plantilla"
                            onClick={onDownloadTemplate}
                        />
                    </div>
                </div>

                <div className="flex w-full justify-between">
                    <label className="text-sm text-gray-600 md:col-span-8 font-semibold flex items-center gap-2">
                        <span>Subir plantilla EEFF</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${fileUploaded ? 'bg-emerald-50 text-[#50cd89] border border-[#50cd89]' : 'bg-amber-50 border border-amber-400 text-amber-400'}`}
                        >
                            {fileUploaded ? 'Cargado' : 'Pendiente'}
                        </span>
                        {!fileUploaded && (
                            <input
                                type="text"
                                name="fileUsername"
                                value=""
                                id="fileUsername"
                                className="hidden"
                                required
                            />
                        )}
                    </label>
                    <div className="md:col-span-4 md:flex md:justify-end">
                        <IconActionButton
                            iconClassName="fa-solid fa-file-import"
                            ariaLabel="Subir plantilla"
                            onClick={onUploadTemplate}
                        />
                    </div>
                </div>

                {fileUploaded && (
                    <div id="fileUsernameAlert" className="rounded border border-[#50cd89]/30 bg-[#50cd89]/10 p-3">
                        <div className="flex items-center gap-2 text-[#50cd89]">
                            <i className="fa-regular fa-circle-check text-lg text-[#50cd89]"></i>
                            <div className="relative w-full flex items-center justify-between gap-2">
                                <span className='text-sm'>Plantilla cargada: {formData.fileUsername}</span>
                                <div className="flex items-center gap-2">
                                    {uploadedFileUrl && (
                                        <a
                                            href={uploadedFileUrl}
                                            download={formData.fileUsername || undefined}
                                            title="Descargar plantilla cargada"
                                            id="fileUsernameUrl"
                                            className="text-[#50cd89]"
                                        >
                                            <i className="fa-solid fa-file-arrow-down text-lg"></i>
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        className="rounded px-2 py-1 text-[11px] font-semibold text-[#50cd89] cursor-pointer hover:bg-[#50cd89]/10 transition-colors"
                                        onClick={onClearUploadedFile}
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <FormField
                    label="Acciones"
                    name="action"
                    type="text"
                    value={formData.action}
                    onChange={onInputChange}
                />
            </div>

            <div className="mt-6">
                <button type="submit" className="w-full rounded bg-sky-500 py-2 text-md font-semibold text-white transition-colors hover:bg-sky-700 cursor-pointer">
                    CALCULAR
                </button>
            </div>
        </div>
    </form>
);
