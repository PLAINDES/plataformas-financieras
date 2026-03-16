import React from "react";


export interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  isInHeader?: boolean;
}

interface FinanceNavbarProps {
  logo: { src: string; alt: string; href: string };
  isFormOpen: boolean;
  onToggleForm: () => void;
  tabs: NavTab[];
  selectedTabId: string;
  onNavigate: (id: string) => void;
  actions?: React.ReactNode;
}

export const FinanceNavbar: React.FC<FinanceNavbarProps> = ({
  logo,
  isFormOpen,
  onToggleForm,
  tabs,
  selectedTabId,
  onNavigate,
  actions

}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        <div className="flex items-center gap-2">
          <a href={logo.href} className="flex items-center">
            <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
          </a>

          <button
            onClick={onToggleForm}
            className={`p-3 rounded-lg transition-all ${isFormOpen ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6"/><path d="M4 2h10"/><rect x="4" y="18" width="16" height="4" rx="1"/><rect x="4" y="6" width="16" height="4" rx="1"/></svg>
          </button>

          <div className="flex lg:hidden gap-1">
            {tabs
              .filter(tab => tab.isInHeader)
              .map(tab =>  (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`p-3 rounded-lg ${selectedTabId === tab.id ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
                >
                  {tab.icon}
                </button>
              ))}
          </div>
        </div>

        <div className="flex items-center gap-4">

          <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 pr-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTabId === tab.id ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={selectedTabId === tab.id ? "text-blue-600" : "text-gray-400"}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {actions}
          </div>
        </div>
      </div>
    </nav>
  );
};