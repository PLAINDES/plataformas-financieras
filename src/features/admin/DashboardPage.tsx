import "./AdminLayout.css";
import { DashboardHero } from "./components/dashboard/DashboardHero";
import { ModuleShortcuts } from "./components/dashboard/ModuleShortcuts";
import { GettingStarted } from "./components/dashboard/GettingStarted";
// Example Dashboard Component
const DashboardPage: React.FC = () => {
  return (
    <>
      {/* Toolbar */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <h1 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase">
          Dashboard
        </h1>
        <h3 className="text-xs sm:text-sm font-medium text-gray-500">
          Panel de control y accesos directos.
        </h3>
      </header>

      {/* Content */}
      <div className="flex-1 py-5 md:py-8">
        <div className="container mx-auto max-w-7xl space-y-6 px-4">
          <DashboardHero />
          <ModuleShortcuts />
          <GettingStarted />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
