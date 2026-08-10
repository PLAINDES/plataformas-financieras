// src/features/landing/LandingPage.tsx
import { useEffect, useState } from "react";
import { HeroSection } from "./sections/HeroSection";
import { PlatformCardsSection } from "./sections/PlatformCardsSection";
import { WhatsAppSection } from "./sections/WhatsAppSection";
import { CTASection } from "./sections/CTASection";
import TeamSection from "./sections/TeamSection";
import { ProductsSection } from "./sections/ProductsSection";
import { LandingHeader } from "./layout/LandingHeader";
import { LandingFooter } from "./layout/LandingFooter";
import { ScrollTop } from "@/shared/components/layout/ScrollTop";
import ErrorFallback from "@/shared/components/ErrorFallback";
import { useLandingData } from "@/features/landing/hooks/useLandingData";
import { useLandingCMS } from "@/features/landing/hooks/useLandingCMS";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import type { Company } from "@/shared/types";
import type { User } from "@/shared/types/user.types";
import type { LoginCredentials, RegisterData } from "../auth/types/user.types";
import { MainService } from "@/shared/services/main.service";

const COMPANY: Company = {
    id: 1,
    name: "Plataforma Finanzas",
    host: "https://kapitals.org",
    logos: [
        { id: 1, patch: "/images/logo.png", type: "default" },
        { id: 2, patch: "/images/diseñador.png", type: "sticky" },
    ],
};

interface LandingPageProps {
    company: Company;
    user: User | null;
    onLogout: () => void;
    onLogin: (credentials: LoginCredentials) => Promise<User>;
    onRegister: (data: RegisterData) => Promise<User>;
}

export function LandingPage({
    user,
    onLogout,
    onLogin,
    onRegister,
}: LandingPageProps) {
    useAnalytics(); // Trackea métricas automáticamente en la landing page
    const {
        data,
        loading,
        menuItems,
        findContent,
        getContentData,
        updateContentLocally,
    } = useLandingData();
    const {
        handleSaveContent,
        handleSaveCollection,
        handleSaveMenuItems,
        handleSaveFooter,
        handleUploadClientLogo,
    } = useLandingCMS(data, updateContentLocally, findContent);

    const [whatsappOpen, setWhatsappOpen] = useState(false);
    const [hasActiveReports, setHasActiveReports] = useState(false);

    useEffect(() => {
        let ignore = false;
        MainService.getReports({ activo: true })
            .then((reports) => {
                if (!ignore) setHasActiveReports(reports.length > 0);
            })
            .catch(() => {
                if (!ignore) setHasActiveReports(false);
            });
        return () => {
            ignore = true;
        };
    }, []);

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    if (!data)
        return (
            <ErrorFallback message="No se pudieron cargar los datos del sitio. Intenta recargar la página o contacta al administrador." />
        );

    return (
        <div className="relative landing-page">
            <LandingHeader
                company={COMPANY}
                menuItems={menuItems}
                user={user}
                content={getContentData("header")}
                onLogout={onLogout}
                onLogin={onLogin}
                onRegister={onRegister}
                onSave={handleSaveContent}
                onSaveMenuItems={handleSaveMenuItems}
            />

            <div style={{ minHeight: "100vh" }}>
                <HeroSection
                    content={getContentData("hero-home")}
                    onSave={handleSaveContent}
                />
                <PlatformCardsSection
                    content={getContentData("platforms")}
                    onSave={handleSaveContent}
                    onSaveCollection={handleSaveCollection}
                />
                <CTASection
                    content={getContentData("cta-home")}
                    onSave={handleSaveContent}
                />
                {/* <ClientsSection
                    content={getContentData("clients")}
                    onSave={handleSaveContent}
                    onSaveCollection={handleSaveCollection}
                    onUploadImage={handleUploadClientLogo}
                /> */}
            </div>

            {/*<BenefitsSection
        content={getContentData("benefits-home")}
        onSave={handleSaveContent}
      />*/}
            {hasActiveReports && (
                <ProductsSection
                    content={getContentData("products")}
                    onSave={handleSaveContent}
                    onSaveCollection={handleSaveCollection}
                />
            )}
            <TeamSection
                content={getContentData("team")}
                onSave={handleSaveContent}
                onSaveCollection={handleSaveCollection}
                onUploadImage={handleUploadClientLogo}
            />
            {/*<ContactSection
        content={getContentData("contact-home")}
        onSave={handleSaveContent}
      />*/}
            <WhatsAppSection
                content={getContentData("cta-home")}
                onSave={handleSaveContent}
                onUploadImage={handleUploadClientLogo}
                isOpen={whatsappOpen}
                onToggle={setWhatsappOpen}
            />
            <LandingFooter
                content={getContentData("main-footer")}
                ctaContent={getContentData("cta-home")}
                onSave={handleSaveFooter}
            />
            <ScrollTop whatsappOpen={whatsappOpen} />
        </div>
    );
}
