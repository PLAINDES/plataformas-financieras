// src/components/common/MobileMenuToggle.tsx
import { Menu } from "lucide-react";

interface MobileMenuToggleProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function MobileMenuToggle({
  onClick,
  isOpen = false,
}: MobileMenuToggleProps) {
  return (
    <button
      className={`
        lg:hidden inline-flex items-center justify-center p-2 rounded-md 
        text-gray-600 hover:text-blue-600 hover:bg-blue-50 
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${isOpen ? "bg-blue-50 text-blue-600" : ""}
      `}
      id="kt_landing_menu_toggle"
      onClick={onClick}
      aria-label="Toggle mobile menu"
      aria-expanded={isOpen}
    >
      <span className="w-8 h-8 flex items-center justify-center">
        {/*<svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200"
        >
          <path 
            d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z" 
            fill="currentColor"
          />
          <path 
            opacity="0.3" 
            d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z" 
            fill="currentColor"
          />
        </svg>*/}
        <Menu size={26} />
      </span>
    </button>
  );
}
