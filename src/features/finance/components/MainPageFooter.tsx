import { WhatsAppIcon } from "@/features/landing/sections/CTASection";

type MainPageFooterProps = {
  brandName?: string;
  brandHref?: string;
};

export const MainPageFooter: React.FC<MainPageFooterProps> = ({
  brandName,
  brandHref,
}) => {
  return (
    <footer className="py-2 bg-[#e8fff3] border-t border-green-100 ">
      <section className="container mx-auto px-4 py-5 w-full">
        <main className="flex flex-row items-center justify-evenly gap-x-16">
          <a
            className="border border-gray-300 relative w-24 h-24 self-end bg-linear-to-br from-slate-300 to-slate-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            href={brandHref}
          >
            <img
              src="/images/logo-valora.png"
              className="absolute w-16 h-10 my-auto"
              alt={brandName || "Logo"}
            />
          </a>
          <article className="">
            <div className="flex flex-col gap-y-4">
              <img
                src="/images/logo-profinance.png"
                alt="Logo Pro Finance"
                className="w-48 m-auto"
              />
              <button
                type="submit"
                className="cursor-pointer flex flex-row gap-2 px-8 justify-center items-center py-2 bg-valora-primary text-white text-lg font-semibold rounded-sm hover:bg-valora-secondary transition-colors"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                Únete a la comunidad
              </button>
            </div>
          </article>
        </main>
      </section>
    </footer>
  );
};
