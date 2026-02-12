import React from 'react';

export type ReportQuoteModalProps = {
    isOpen: boolean;
    email: string;
    phone: string;
    message: string;
    onClose: () => void;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onMessageChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const ReportQuoteModal: React.FC<ReportQuoteModalProps> = ({
    isOpen,
    email,
    phone,
    message,
    onClose,
    onEmailChange,
    onPhoneChange,
    onMessageChange,
    onSubmit
}) => (
    <div className={`fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className={`w-full max-w-lg rounded-xl bg-white shadow-xl transition-transform duration-300 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-3 scale-95'}`}>
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <h4 className="text-lg font-semibold text-gray-800 ">Cotizar consultoria</h4>
                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={onClose}
                    aria-label="Cerrar cotizacion"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <form className=" flex flex-col" onSubmit={onSubmit}>
                <div className='border-b border-gray-100 pb-6'>
                    <div className='p-6 flex flex-col gap-4'>
                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={event => onEmailChange(event.target.value)}
                                className="rounded bg-gray-50 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                            Numero telefonico
                            <input
                                type="tel"
                                value={phone}
                                onChange={event => onPhoneChange(event.target.value)}
                                className="rounded bg-gray-50 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                            Mensaje
                            <textarea
                                rows={4}
                                value={message}
                                onChange={event => onMessageChange(event.target.value)}
                                className="rounded bg-gray-50 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </label>
                    </div>
                </div>
                <div className='flex justify-end p-6'>
                    <button
                        type="submit"
                        className="rounded bg-blue-600 px-4 py-2 text-md font-semibold text-white cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    </div>
);
