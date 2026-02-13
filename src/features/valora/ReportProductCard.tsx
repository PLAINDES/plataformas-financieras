import React from 'react';

export type ReportProductCardProps = {
    title: string;
    iconClassName: string;
    selected: boolean;
    onSelect: () => void;
};

export const ReportProductCard: React.FC<ReportProductCardProps> = ({
    title,
    iconClassName,
    selected,
    onSelect
}) => (
    <button
        type="button"
        className={`group flex flex-col gap-4 items-center border-2 rounded-xl p-10 py-7 shadow-md transition-colors hover:border-blue-600 ${selected ? 'border-blue-600' : 'border-gray-300 bg-white'} cursor-pointer`}
        onClick={onSelect}
        aria-pressed={selected}
    >
        <div className='rounded-full bg-[#ede7f6] w-10 flex justify-center items-center h-10 p-8'>
            <i className={`${iconClassName} ${selected ? 'text-blue-600!' : ''} group-hover:text-blue-600`}></i>
        </div>
        <p className={`w-20 text-center text-sm group-hover:text-blue-600 ${selected ? 'text-blue-600' : ''}`}>{title}</p>
    </button>
);
