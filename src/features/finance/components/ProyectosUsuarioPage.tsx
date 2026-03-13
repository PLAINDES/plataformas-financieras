import React, { useState } from "react";
import { MainPageFooter } from "./MainPageFooter";
import Chatbot from "./Chatbot";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NavBar } from "../kapital/components/NavBar";
import { Proyectos } from "./Proyectos";


interface ProyectosUsuarioPageProps {
  heroTitle?: string;
  brandName?: string;
  brandHref?: string;
  onOpenForm: () => void;
}

const ProyectosUsuarioPage: React.FC<ProyectosUsuarioPageProps> = ({
  heroTitle = "Kapital",
  brandName = "Kapital",
  brandHref = "Kapital",
  onOpenForm,
}) => {
  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState<boolean>(true);
  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const handleReportSidebarOpen = (): void => {
    setIsReportSidebarOpen(true);
    if (isDesktopFormOpen) setIsDesktopFormOpen(false);
  };

  const handleLogout = (): void => {};

  void heroTitle;
  void isReportSidebarOpen;
  void onOpenForm;

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <NavBar user={user} onLogout={handleLogout} onToggleForm={() => setIsDesktopFormOpen((prev) => !prev)}
        isFormOpen={isDesktopFormOpen} onOpenReport={handleReportSidebarOpen} hasResults={false} selected={""}/>
      <div className="">
        <div className="flex flex-1 flex-col-3 items-center justify-center py-20 px-6 bg-[#f3f6f9] overflow-y-auto">
          <Proyectos userId={user?.id} />
        </div>
        <div>
          <MainPageFooter brandName={brandName} brandHref={brandHref} />
        </div>
      </div>

      <Chatbot geminiApiKey="" />
    </div>
  );
};

export default ProyectosUsuarioPage;