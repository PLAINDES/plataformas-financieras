import React from 'react';

export type ValoraResultsSection = 'estados' | 'resultados' | 'analisis' | 'metodologia';

export interface ValoraResultsTabsProps {
    activeSection: ValoraResultsSection;
    onChange: (section: ValoraResultsSection) => void;
    orientation?: 'horizontal' | 'vertical';
    onOpenReportSidebar?: () => void;
}

const tabs: Array<{
    key: ValoraResultsSection;
    label: string;
    icon: React.ReactNode;
}> = [
        {
            key: 'estados',
            label: 'Estados Financieros',
            icon: <i className="fa-solid fa-coins text-sm" aria-hidden="true"></i>
        },
        {
            key: 'resultados',
            label: 'Resultados',
            icon: <i className="fa-solid fa-square-poll-vertical text-sm" aria-hidden="true"></i>
        },
        {
            key: 'analisis',
            label: 'Analisis',
            icon: <i className="fa-solid fa-chart-line text-sm" aria-hidden="true"></i>
        },
        {
            key: 'metodologia',
            label: 'Metodologia',
            icon: (
                <svg
                    className="w-5 h-5"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor"></path>
                    <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor"></rect>
                    <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor"></rect>
                    <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor"></rect>
                    <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor"></path>
                </svg>
            )
        },
    ];

export const ValoraResultsTabs: React.FC<ValoraResultsTabsProps> = ({
    activeSection,
    onChange,
    onOpenReportSidebar
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className='border-b border-gray-200'>
                <h2 className='font-bold p-4 text-lg'>Navegación</h2>
            </div>
            <ul className={'flex flex-col gap-1 p-2 px-4 border-b pb-6 pt-0 border-gray-200'}>
                {tabs.map(tab => {
                    const isActive = tab.key === activeSection;
                    const activeClassName = isActive
                        ? 'text-blue-600 bg-blue-50 shadow-sm '
                        : 'border-transparent text-gray-500 hover:bg-gray-50';
                    return (
                        <li key={tab.key}>
                            <button
                                type="button"
                                className={`w-full flex items-center gap-4 text-sm duration-300  cursor-pointer p-4 py-3 rounded-md font-medium transition-colors ${activeClassName}`}
                                onClick={() => onChange(tab.key)}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
            {onOpenReportSidebar && (
                <button
                    type="button"
                    className="m-6 my-0 flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 shadow-md transition-all duration-200"
                    onClick={onOpenReportSidebar}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Generar reporte
                </button>
            )}
        </div>
    );
};
