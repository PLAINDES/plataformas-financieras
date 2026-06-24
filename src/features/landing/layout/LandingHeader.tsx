// src/features/landing/layout/LandingHeader.tsx
import { useState, useEffect } from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingUserMenu } from "../components/LandingUserMenu";
import { MobileMenuToggle } from "@/shared/components/ui/MobileMenuToggle";
import { LoginModal } from "../../auth/components/LoginModal";
import { RegisterModal } from "../../auth/components/RegisterModal";
import { useAuthModal } from "../../auth/hooks/useAuthModal";
import { EditableImage } from "@/shared/components/editable/EditableImage";
import { HeaderEditModal } from "./HeaderEditModal";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { useScrollSpy } from "../hooks/useScrollSpy";
import type { MenuItem, Company } from "@/shared/types";
import type {
    User,
    LoginCredentials,
    RegisterData,
} from "../../auth/types/user.types";

interface HeaderProps {
    company: Company;
    menuItems: MenuItem[];
    user: User | null;
    content?: any;
    onLogout: () => void;
    onLogin: (credentials: LoginCredentials) => Promise<User>;
    onRegister: (data: RegisterData) => Promise<User>;
    onSave?: (content: any) => Promise<void>;
    onSaveMenuItems?: (items: { title: string }[]) => Promise<void>;
}

export function LandingHeader({
    menuItems,
    user,
    content,
    onLogout,
    onLogin,
    onRegister,
    onSave,
    onSaveMenuItems,
}: HeaderProps) {
    const [isSticky, setIsSticky] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string>("home");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const { isAdmin } = useAuthContext();

    const {
        isLoginOpen,
        isRegisterOpen,
        openLogin,
        closeModal,
        switchToRegister,
        switchToLogin,
    } = useAuthModal();

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleMenuClick = (title: string) => {
        const id = title.toLowerCase().replace(/\s+/g, "-");
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            window.scrollTo({
                top: elementRect - bodyRect - offset,
                behavior: "smooth",
            });
        }
        setActiveMenu(id);
        setIsMobileMenuOpen(false);
    };

    useScrollSpy(
        menuItems.map((item) => item.slug.toLowerCase()),
        setActiveMenu
    );

    const navItems = menuItems.map((item, index) => ({
        id: String(item.id ?? index),
        title: item.name,
        slug: item.slug,
    }));

    return (
        <header className="relative w-full" id="home">
            <nav
                className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${isSticky ? "bg-white/90 backdrop-blur-lg h-16 lg:h-20 shadow-sm" : "bg-transparent h-28 lg:h-32"}`}
            >
                <div className="max-w-350 mx-auto px-6 grid grid-cols-2 lg:grid-cols-12 items-center h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-4 lg:col-span-3">
                        <div className="lg:hidden">
                            <MobileMenuToggle
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                isOpen={isMobileMenuOpen}
                            />
                        </div>
                        <div className="relative">
                            {/* Stacked layout — visible cuando NO sticky */}
                            <div
                                className={`flex flex-col items-start gap-1 transition-all duration-700 ${
                                    isSticky
                                        ? "opacity-0 scale-95 pointer-events-none absolute inset-0"
                                        : "opacity-100 scale-100 relative"
                                }`}
                            >
                                <div className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105">
                                    <EditableImage
                                        content={{
                                            value: content?.logo || "images/logo.png",
                                            id: "header_logo",
                                            type: "text",
                                            section: "header",
                                        }}
                                        onSave={onSave!}
                                        alt="Logo"
                                        className="w-auto object-contain h-14 lg:h-16"
                                    />
                                </div>
                                <div className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105">
                                    <EditableImage
                                        content={{
                                            value: content?.logo_right || "images/logo.png",
                                            id: "header_logo_right",
                                            type: "text",
                                            section: "header",
                                        }}
                                        onSave={onSave!}
                                        alt="Logo secundario"
                                        className="w-auto object-contain h-11 lg:h-13"
                                    />
                                </div>
                            </div>

                            {/* Side-by-side layout — visible cuando sticky */}
                            <div
                                className={`flex flex-row items-center gap-3 transition-all duration-700 ${
                                    isSticky
                                        ? "opacity-100 scale-100 relative"
                                        : "opacity-0 scale-95 pointer-events-none absolute inset-0"
                                }`}
                            >
                                <div className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105">
                                    <EditableImage
                                        content={{
                                            value: content?.logo || "images/logo.png",
                                            id: "header_logo",
                                            type: "text",
                                            section: "header",
                                        }}
                                        onSave={onSave!}
                                        alt="Logo"
                                        className="w-auto object-contain h-10 lg:h-12"
                                    />
                                </div>
                                <div className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105">
                                    <EditableImage
                                        content={{
                                            value: content?.logo_right || "images/logo.png",
                                            id: "header_logo_right",
                                            type: "text",
                                            section: "header",
                                        }}
                                        onSave={onSave!}
                                        alt="Logo secundario"
                                        className="w-auto object-contain h-8 lg:h-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden lg:flex justify-center lg:col-span-6">
                        <div className="flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = activeMenu === item.slug.toLowerCase();
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.slug.toLowerCase()}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMenuClick(item.title);
                                        }}
                                        className={`px-5 py-2 rounded-full text-[16px] tracking-tight transition-all duration-300 ${isActive ? "text-valora-primary" : "text-gray-600 hover:text-valora-primary"}`}
                                    >
                                        {item.title}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-3 lg:col-span-3">
                        <a
                            href="#contacto"
                            className="hidden xl:block text-[11px] text-gray-400 hover:text-valora-primary transition-colors uppercase tracking-widest"
                        >
                            Soporte
                        </a>
                        <div className="h-6 w-px bg-gray-200 hidden lg:block mx-2" />
                        {user ? (
                            <LandingUserMenu user={user} onLogout={onLogout} />
                        ) : (
                            <Button
                                onClick={openLogin}
                                className="h-9 lg:h-10 px-6 rounded-lg bg-valora-primary text-white text-xs hover:bg-valora-secondary active:scale-95 shadow-sm"
                            >
                                Iniciar Sesión
                            </Button>
                        )}

                    </div>
                </div>

                {/* Botón flotante editar — solo admin, esquina superior derecha */}
                {isAdmin && (
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="absolute cursor-pointer top-5 right-20 xl:right-60 2xl:right-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-sm transition-all shadow-sm"
                        title="Editar menú"
                    >
                        <Pencil size={11} />
                        Editar menú
                    </button>
                )}
            </nav>

            {/* Mobile Drawer */}
            <div
                className={`fixed inset-0 z-100 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? "visible" : "invisible"}`}
            >
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
                />
                <aside
                    className={`absolute top-0 left-0 h-full w-70 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50">
                            <img src="images/logo.png" alt="Logo" className="h-8" />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                            >
                                <X className="text-gray-500" size={14} />
                            </Button>
                        </div>
                        <nav className="flex flex-col p-4 pt-10 gap-y-1">
                            {navItems.map((item) => {
                                const isActive = activeMenu === item.slug.toLowerCase();
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.slug.toLowerCase()}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMenuClick(item.title);
                                        }}
                                        className={`px-4 py-3 rounded-md text-sm transition-all ${isActive ? "bg-valora-primary/10 text-valora-primary" : "text-gray-700 hover:bg-gray-50 hover:text-valora-secondary"}`}
                                    >
                                        {item.title}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>
                </aside>
            </div>

            <LoginModal
                isOpen={isLoginOpen}
                onClose={closeModal}
                onLogin={onLogin}
                onSwitchToRegister={switchToRegister}
            />
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={closeModal}
                onRegister={onRegister}
                onSwitchToLogin={switchToLogin}
            />

            {/* Modal de edición */}
            <HeaderEditModal
                open={editModalOpen}
                items={navItems}
                onClose={() => setEditModalOpen(false)}
                onSave={async (items) => {
                    await onSaveMenuItems?.(items);
                }}
            />

            <div className="h-28 lg:h-32" />
        </header>
    );
}
