import React from 'react';

export const MainPageFooter: React.FC = () => (
    <>
        <footer className="flex-1/6 bg-green-50 border-t border-green-100">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                            </svg>
                            Kapital
                        </h2>
                        <p className="text-sm text-gray-600">
                            Calcula el costo de capital de tu empresa, proyecto o inversion; de forma rapida y confiable
                        </p>
                        <a className="text-sm text-green-600" href="/kapital">
                            <i className="fas fa-link me-1 text-primary"></i>
                            Ingresa a Kapital
                        </a>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            Suscríbete
                        </h2>
                        <p className="text-sm text-gray-600 mb-3">
                            Suscríbete ahora para estar al tanto de lo último en finanzas, como webinars, noticias y ofertas.
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                alert(`Suscripción: ${formData.get('email')}`);
                                e.currentTarget.reset();
                            }}
                            className="flex gap-2"
                        >
                            <input
                                type="email"
                                name="email"
                                placeholder="Tu email"
                                required
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Suscribirse
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    </>

);
