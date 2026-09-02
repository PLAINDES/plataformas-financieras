import { useState, useEffect } from "react";
import { cmsService } from "@/shared/services/cms.service";
import { WhatsAppIcon } from "@/features/landing/sections/CTASection";
import { buildWhatsAppUrl } from "@/shared/utils/whatsapp";

type MainPageFooterProps = {
    brandName?: string;
    brandHref?: string;
};

export const MainPageFooter: React.FC<MainPageFooterProps> = ({
    brandName,
    brandHref,
}) => {
    const [whatsappData, setWhatsappData] = useState<{
        url: string;
        text: string;
    } | null>(null);

    useEffect(() => {
        cmsService
            .getLandingData()
            .then((res) => {
                const cta = (res.page as any)?.contents?.find(
                    (c: any) => c.slug === "cta-home"
                )?.data;
                if (cta && cta.whatsappNumber) {
                    setWhatsappData({
                        url: cta.whatsappNumber,
                        text: cta.text || "Únete a la comunidad",
                    });
                }
            })
            .catch((err) => console.error("Error cargando CTA:", err));
    }, []);

    const handleWhatsAppClick = () => {
        const url = buildWhatsAppUrl(whatsappData?.url || "");
        if (url) {
            window.open(url, "_blank");
        }
    };

    return (
        <footer className="py-2 bg-[#e8fff3] border-t border-green-100 ">
            <section className="container mx-auto px-4 py-5 w-full">
                <main className="flex flex-col sm:flex-row items-center justify-evenly gap-8 sm:gap-2 md:gap-x-16">
                    <a
                        className="border border-valora-primary/20 relative size-18 md:w-24 md:h-24 self-end bg-valora-primary/10 max-sm:mx-auto rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        href={brandHref}
                    >
                        <img
                            src="/images/logo-valora.png"
                            className="absolute w-12 h-8 md:w-16 md:h-10 my-auto"
                            alt={brandName || "Logo"}
                        />
                    </a>
                    <article className="">
                        <div className="flex flex-col gap-y-4">
                            <img
                                src="/images/logo-profinance.png"
                                alt="Logo Pro Finance"
                                className="w-32 md:w-48 m-auto"
                            />
                            <button
                                type="button"
                                onClick={handleWhatsAppClick}
                                className="cursor-pointer flex flex-row gap-2 px-8 justify-center items-center py-2 bg-valora-primary text-white text-sm md:text-lg font-semibold rounded-sm hover:bg-valora-secondary transition-colors"
                            >
                                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                                {whatsappData?.text || "Únete a la comunidad"}
                            </button>
                        </div>
                    </article>
                </main>
            </section>
        </footer>
    );
};
