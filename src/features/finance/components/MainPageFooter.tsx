type MainPageFooterProps = {
  brandName: string;
  brandHref: string;
};

export const MainPageFooter: React.FC<MainPageFooterProps> = ({
  brandName,
  brandHref,
}) => (
  <footer className="flex-1/6 bg-[#e8fff3] border-t border-green-100">
    <section className="container mx-auto px-4 py-5 w-full">
      <main className="grid md:grid-cols-2 gap-5">
        <article className="max-w-lg mx-auto">
          <h2 className="text-lg xl:text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                clipRule="evenodd"
              />
            </svg>
            {brandName}
          </h2>
          <p className="text-sm text-gray-600">
            Obtén una evaluación precisa y confiable para tomar decisiones
            informadas.
          </p>
          <a className="text-sm text-valora-primary" href={brandHref}>
            Evalua el verdadero valor de tu empresa con nuestra plataforma de
            valoración financiera.
          </a>
        </article>
        <article className="max-w-lg mx-auto">
          <h2 className="text-lg xl:text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Suscríbete
          </h2>
          <div className="flex flex-col gap-y-2">
            <p className="text-sm text-gray-600">
              Suscríbete ahora para estar al tanto de lo último en finanzas,
              como webinars, noticias y ofertas.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                alert(`Suscripción: ${formData.get("email")}`);
                e.currentTarget.reset();
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                name="email"
                placeholder="Escriba acá su E-mail"
                required
                className="bg-white flex-1 px-4 py-1 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-700 focus:border-valora-secring-valora-secondary outline-none"
              />
              <button
                type="submit"
                className="cursor-pointer px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-sm hover:bg-green-700 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </article>
      </main>
    </section>
  </footer>
);
