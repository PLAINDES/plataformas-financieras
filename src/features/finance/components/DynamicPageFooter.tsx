import { useState } from "react";

export const DynamicPageFooter: React.FC = () => {
  const [isCollapsed, _setIsCollapsed] = useState(false);

  return (
    <div
      className={`w-full transition-all duration-500 ease-in-out overflow-hidden bg-white ${
        isCollapsed ? "h-16" : "h-60"
      }`}
    >
      <div
        className="w-full h-full bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/images/footer-kapital.webp')",
        }}
      >
        {/* CONTENIDO COLAPSADO */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <button className="bg-white text-gray-900 px-6 py-1.5 rounded-full font-semibold text-sm shadow-md hover:bg-gray-50 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};
