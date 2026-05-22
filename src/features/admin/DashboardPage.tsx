import "./AdminLayout.css";
import { Link } from "react-router-dom";
// Example Dashboard Component
const DashboardPage: React.FC = () => {
  return (
    <>
      {/* Toolbar */}
      <div className=" py-3 md:py-6">
        <div className="container mx-auto flex flex-col flex-wrap justify-between px-4 md:flex-row md:items-center">
          {/* Page Title */}
          <div className="mb-3 flex flex-col justify-center md:mb-0 md:mr-3">
            <h1 className="mb-0 text-2xl font-bold text-gray-900 md:text-3xl">
              DASHBOARD
            </h1>
            {/* Breadcrumb */}
            <ul className="mt-1 flex items-center space-x-2 text-sm font-semibold">
              <li className="text-gray-500">
                <Link
                  to="/admin"
                  className="transition-colors hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2 inline-block h-0.5 w-1.5 rounded-full bg-gray-400" />
              </li>
              <li className="text-gray-500">Dashboards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-5 md:py-8">
        <div className="container mx-auto px-4">
          {/* Main Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div
              className="flex min-h-100 flex-col justify-between bg-cover bg-center bg-no-repeat p-6 pb-0 md:min-h-125 md:p-9"
              style={{
                backgroundImage: "url('assets/media/stock/900x600/42.png')",
                backgroundPosition: "100% 50%",
              }}
            >
              {/* Content */}
              <div className="mb-10 text-center">
                <div className="mb-8 text-xl font-bold text-gray-800 md:mb-13 md:text-3xl">
                  <span className="mr-2">
                    ADMINISTRADOR
                    <br />
                    <span className="relative inline-block">
                      <a
                        href="/"
                        className="text-primary transition-opacity hover:opacity-75"
                      >
                        HOME
                      </a>
                      <span className="absolute bottom-0 left-0 h-1 w-full border-b-4 border-primary opacity-15" />
                    </span>
                  </span>
                </div>
              </div>

              {/* Illustration */}
              <div className="mx-auto mb-0 h-32 w-auto md:h-48 lg:h-56">
                <img
                  className="hidden h-full w-auto dark:block"
                  src="/images/Big Shoes - Hero.png"
                  alt="Imagen"
                />
                <img
                  className="block h-full w-auto dark:hidden"
                  src="/images/Big Shoes - Hero.png"
                  alt="Imagen"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
