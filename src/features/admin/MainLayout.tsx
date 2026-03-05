import React, { useState } from 'react';
import Sidebar from './SideBar';
import { ScrollTop, Footer } from './AdminLayout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  return (
    <div className="flex min-h-screen bg-[#e9edf1]">
      {/* Sidebar */}
      <Sidebar 
        isMinimized={isSidebarMinimized} 
        onToggleMinimize={toggleSidebar} 
      />

      {/* Main Content Area */}
      <div 
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarMinimized ? 'lg:ml-0' : 'lg:ml-0'
        }`}
      >
        {/* Content */}
        <main className="flex-1 pb-20">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Scroll to Top */}
        <ScrollTop />
      </div>
    </div>
  );
};

export default MainLayout;