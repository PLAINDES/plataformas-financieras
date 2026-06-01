import { useEffect } from "react";
import React, { useState } from "react";
import { MainPageFooter } from "./MainPageFooter";
import { NavBar } from "../kapital/components/NavBar";
import { Proyectos } from "./Proyectos";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { useToast } from "@/shared/components/common/ToastProvider";
import { useNavigate } from "react-router-dom";

interface ProyectosUsuarioPageProps {
  heroTitle?: string;
  brandName?: string;
  brandHref?: string;
  onOpenForm?: () => void;
}

const ProyectosUsuarioPage: React.FC<ProyectosUsuarioPageProps> = ({
  heroTitle = "Kapital",
  brandName = "Kapital",
  brandHref = "Kapital",
}) => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuthContext();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) {
      addToast(
        "Por favor, inicia sesión para acceder a tus proyectos.",
        "warn"
      );
      navigate("/kapital");
    }
  }, [user, addToast, navigate]);

  if (!user) {
    return null;
  }

  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState<boolean>(true);
  const [isReportSidebarOpen, setIsReportSidebarOpen] =
    useState<boolean>(false);
  const handleReportSidebarOpen = (): void => {
    setIsReportSidebarOpen(true);
    if (isDesktopFormOpen) setIsDesktopFormOpen(false);
  };
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };
  void heroTitle;
  void isReportSidebarOpen;

  return (
    <div className="flex flex-col w-full h-screen">
      <NavBar
        user={user}
        onLogout={handleLogout}
        onToggleForm={() => setIsDesktopFormOpen((prev) => !prev)}
        isFormOpen={isDesktopFormOpen}
        onOpenReport={handleReportSidebarOpen}
        hasResults={false}
        onLoginClick={() => setIsLoginModalOpen(true)}
        selected={""}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex flex-1 flex-col-3 justify-center py-20 px-3 md:px-6 bg-[#f3f6f9] overflow-y-auto">
          <Proyectos userId={user?.id} />
        </div>
        <div>
          <MainPageFooter brandName={brandName} brandHref={brandHref} />
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={login}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProyectosUsuarioPage;
