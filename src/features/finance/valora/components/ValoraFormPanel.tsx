import React from 'react';
import { IconActionButton } from '../../../../shared/components/ui/IconActionButton';
import { FormField } from '../../components/FormField';
import type { FormData } from '@/shared/types/ValoraTypes';
import { FormSection } from '../../components/FormSection';


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
    <form className="flex h-full flex-col" onSubmit={onSubmit}>
        <div className="flex-1 bg-white p-2">
            <div className='overflow-auto pb-6'>
                <FormSection step={1} title="Ingrese inputs de su pais">
                    <div className='flex gap-4 flex-col pt-6'>
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
                </FormSection>

                <div className="mt-6">
                    <FormSection step={2} title="Ingrese inputs de su empresa">
                        <div className="flex w-full justify-between pt-6">
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
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${fileUploaded ? 'bg-emerald-50 text-green-500 border border-green-500' : 'bg-amber-50 border border-amber-400 text-amber-400'}`}
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
                            <div id="fileUsernameAlert" className="rounded border border-green-500/30 bg-green-500/10 p-3">
                                <div className="flex items-center gap-2 text-green-500">
                                    <i className="fa-regular fa-circle-check text-lg text-green-500"></i>
                                    <div className="relative w-full flex items-center justify-between gap-2">
                                        <span className='text-sm'>Plantilla cargada: {formData.fileUsername}</span>
                                        <div className="flex items-center gap-2">
                                            {uploadedFileUrl && (
                                                <a
                                                    href={uploadedFileUrl}
                                                    download={formData.fileUsername || undefined}
                                                    title="Descargar plantilla cargada"
                                                    id="fileUsernameUrl"
                                                    className="text-green-500"
                                                >
                                                    <i className="fa-solid fa-file-arrow-down text-lg"></i>
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                className="rounded w-5 h-5 flex justify-center items-center font-semibold text-white bg-red-500 cursor-pointer hover:bg-red-600 transition-colors"
                                                onClick={onClearUploadedFile}
                                            >
                                                <i className="fa-solid fa-trash text-[9px]"></i>
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
                    </FormSection>
                </div>
            </div>
        </div>
        <div className="sticky bottom-0 bg-white p-2 pt-0">
            <button
                type="submit"
                className="w-full rounded bg-blue-600 py-2 text-md font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
            >
                CALCULAR
            </button>
        </div>
    </form>
);
