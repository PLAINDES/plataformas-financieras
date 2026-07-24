import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollTopProps {
    whatsappOpen?: boolean;
}

export function ScrollTop({ whatsappOpen = false }: ScrollTopProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState(whatsappOpen ? "bottom-[520px]" : "bottom-36");

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        toggleVisibility();

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    useEffect(() => {
        setPosition(whatsappOpen ? "bottom-[520px]" : "bottom-36");
    }, [whatsappOpen]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Volver al inicio de la página"
            className={`
                fixed right-6 z-[110]
                flex items-center justify-center
                w-12 h-12 rounded-full
                bg-valora-primary text-white
                shadow-lg shadow-valora-primary/30
                cursor-pointer
                hover:bg-valora-secondary hover:scale-110
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-valora-primary
                ${position}
                transition-all duration-300 ease-out
                ${isVisible
                    ? "opacity-100 translate-y-0 scale-100 rotate-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 scale-90 -rotate-12 pointer-events-none"
                }
            `}
        >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
    );
}
