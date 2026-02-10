import React from 'react';

export const MainPageFooter: React.FC = () => (
    <div className="flex-1/3 lg:flex-1/4 flex flex-col lg:flex-row gap-8 lg:gap-40 bg-[#e8fff3] pt-6 sm:pt-8 px-4 sm:px-8 lg:px-20 lg:pb-15 pb-14 justify-center">
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
                <i className="fa-regular fa-building me-2 text-[#A1A5B7]"></i>
                <h3 className="text-lg sm:text-xl font-semibold">Kapital</h3>
            </div>
            <p className="text-sm">
                Calcula el costo de capital de tu empresa, proyecto o inversion; de forma rapida y confiable
            </p>
            <a className="text-sm text-[#009ef7]" href="/kapital">
                <i className="fas fa-link me-1 text-primary"></i>
                Ingresa a Kapital
            </a>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
                <i className="fa-solid fa-square-poll-vertical me-2 text-[#A1A5B7]"></i>
                <h3 className="text-lg sm:text-xl font-semibold">Subscribete</h3>
            </div>
            <p className="text-sm">
                Subscribete ahora para estar al tanto de lo ultimo en finanzas, como webinars, noticias y ofertas.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    placeholder="Escriba aca su E-mail"
                    className="w-full bg-white px-4 py-2 rounded-md font-medium placeholder:text-gray-400 placeholder:text-md border border-gray-200"
                />
                <button className="bg-[#009ef7] text-white py-2 px-5 rounded font-semibold">
                    Subscribirse
                </button>
            </div>
        </div>
    </div>
);
