<<<<<<< HEAD
import { useState } from "react";
=======
import React, { useState } from "react";
>>>>>>> 629f442 (feat: adding new routes for covers and reports. Also removing videos in landing page, also adding new icons for admin sidebar. normalizing styles in admin with breadcrumbs and header)
import Sidebar from "./SideBar";
import { ScrollTop, Footer } from "./AdminLayout";

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
          isSidebarMinimized ? "lg:ml-[75px]" : "lg:ml-[250px]"
        }`}
      >
        {/* Content */}
        <main className="flex-1 pb-20">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Scroll to Top */}
        <ScrollTop />
      </div>
    </div>
  );
};

export default MainLayout;
