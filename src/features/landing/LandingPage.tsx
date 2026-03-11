// src/features/landing/LandingPage.tsx
import { HeroSection } from "./sections/HeroSection";
import { PlatformCardsSection } from "./sections/PlatformCardsSection";
import { ClientsSection } from "./sections/ClientsSection";
import { BenefitsSection } from "./sections/BenefitsSection";
import { ProductsSection } from "./sections/ProductsSection";
import { ContactSection } from "./sections/ContactSection";
import { CTASection } from "./sections/CTASection";
import TeamSection from "./sections/TeamSection";
import { LandingHeader } from "./layout/LandingHeader";
import { LandingFooter } from "./layout/LandingFooter";
import { ScrollTop } from "@/shared/components/layout/ScrollTop";
import { useLandingData } from "@/features/landing/hooks/useLandingData";
import { useLandingCMS } from "@/features/landing/hooks/useLandingCMS";
import type { Company } from "@/shared/types";
import type {
  User,
  LoginCredentials,
  RegisterData,
} from "../auth/types/user.types";

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
  isAdmin: boolean;
  company: Company;
  user: User | null;
  onLogout: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onRegister: (data: RegisterData) => Promise<User>;
}

export function LandingPage({
  isAdmin,
  user,
  onLogout,
  onLogin,
  onRegister,
}: LandingPageProps) {
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
  } = useLandingCMS(data, updateContentLocally, findContent);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (!data)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading data
      </div>
    );

  return (
    <div className="landing-page">
      <LandingHeader
        company={COMPANY}
        menuItems={menuItems}
        user={user}
        onLogout={onLogout}
        onLogin={onLogin}
        onRegister={onRegister}
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
          isAdmin={isAdmin}
          onSave={handleSaveContent}
        />
        <ClientsSection
          content={getContentData("clients")}
          onSave={handleSaveContent}
          onSaveCollection={handleSaveCollection}
        />
      </div>

      <BenefitsSection
        content={getContentData("benefits-home")}
        onSave={handleSaveContent}
      />
      <ProductsSection
        content={getContentData("products")}
        onSave={handleSaveContent}
        onSaveCollection={handleSaveCollection}
      />
      <TeamSection
        content={getContentData("team")}
        onSave={handleSaveContent}
        onSaveCollection={handleSaveCollection}
      />
      <ContactSection
        content={getContentData("contact-home")}
        onSave={handleSaveContent}
      />

      <LandingFooter
        content={getContentData("main-footer")}
        onSave={handleSaveFooter}
      />
      <ScrollTop />
    </div>
  );
}
