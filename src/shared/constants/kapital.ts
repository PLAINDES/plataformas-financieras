// kapital.ts
// Archivo de constantes

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};

export const DATES = [
  "31/12/2022",
  "31/03/2023",
  "30/06/2023",
  "30/09/2023",
  "31/12/2023",
  "31/03/2024",
  "30/06/2024",
  "31/12/2024",
  "31/03/2025",
  "30/06/2025",
  "31/12/2025",
  "31/03/2026",
].sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime());

export const SECTORS = [
  "Tecnología",
  "Finanzas",
  "Manufactura",
  "Servicios",
  "Retail",
  "Publicidad",
  "Aeroespacial/ Defensa",
  "Transporte aéreo",
  "Confección de ropa",
  "Automóviles y Camiones",
  "Partes de Automóviles",
  "Software (Sistema y aplicación)",
  "Acero",
  "Telecomunicaciones (Inalámbrico)",
  "Equipamiento de telecomunicaciones",
  "Servicios de telecomunicaciones",
];

export const INSTRUMENTS = [
  "Bonos EE.UU",
  "Ajustar Rf según la duración del proyecto",
];

export const BONOS = [
  "0.08",
  "0.17",
  "0.25",
  "0.5",
  "1",
  "2",
  "3",
  "5",
  "7",
  "10",
  "20",
  "30",
];

export const BONOS_TRANSLATIONS: Record<string, string> = {
  "0.08": "0.08 (1m)",
  "0.17": "0.17 (2m)",
  "0.25": "0.25 (3m)",
  "0.5": "0.5 (6m)",
  "1": "1",
  "2": "2",
  "3": "3",
  "5": "5",
  "7": "7",
  "10": "10",
  "20": "20",
  "30": "30",
};

export const COUNTRIES = [
  "Argentina",
  "Brazil",
  "Mexico",
  "Chile",
  "Colombia",
  "Ecuador",
  "Peru",
];

export const COUNTRIES_TRANSLATIONS: Record<string, string> = {
  Argentina: "Argentina",
  Brazil: "Brasil",
  Chile: "Chile",
  Colombia: "Colombia",
  Ecuador: "Ecuador",
  Mexico: "México",
  Peru: "Perú",
};

export const COUNTRY_LOCAL_CURRENCIES: Record<string, string> = {
  Argentina: "ARS",
  Brazil: "BRL",
  Mexico: "MXN",
  Chile: "CLP",
  Colombia: "COP",
  Ecuador: "USD",
  Peru: "PEN",
};

export const REPORT_PRODUCTS = [
  {
    id: "1",
    title: "REPORTE BÁSICO",
    iconClassName: "fa-solid fa-laptop text-2xl text-gray-400",
  },
  {
    id: "2",
    title: "REPORTE DETALLADO",
    iconClassName: "fa-solid fa-laptop text-2xl text-gray-400",
  },
  {
    id: "3",
    title: "REPORTE COMPLETO",
    iconClassName: "fa-solid fa-laptop text-2xl text-gray-400",
  },
];

export const METHODOLOGY_CATEGORIES = [
  {
    name: "Categoría 01",
    products: [
      {
        name: "Curso 01",
        file: "https://drive.google.com/file/d/1Esm2696i0XB6dAAjhgUUtrI0Z85hWywW/preview",
      },
    ],
  },
];

export const EXCLUDED_INDUSTRIES: string[] = [
  "Bank (Money Center)",
  "Banks (Regional)",
  "Financial Svcs. (Non-bank & Insurance)",
];

export const INDUSTRY_TRANSLATIONS: Record<string, string> = {
  Advertising: "Publicidad",
  "Aerospace/Defense": "Aeroespacial/Defensa",
  "Air Transport": "Transporte Aéreo",
  Apparel: "Indumentaria",
  "Auto & Truck": "Automóviles y Camiones",
  "Auto Parts": "Autopartes",
  "Bank (Money Center)": "Banca (Grandes Bancos)",
  "Banks (Regional)": "Bancos (Regionales)",
  "Beverage (Alcoholic)": "Bebidas (Alcohólicas)",
  "Beverage (Soft)": "Bebidas (No Alcohólicas)",
  Broadcasting: "Radiodifusión",
  "Brokerage & Investment Banking": "Corretaje y Banca de Inversión",
  "Building Materials": "Materiales de Construcción",
  "Business & Consumer Services": "Servicios Empresariales y al Consumidor",
  "Cable TV": "Televisión por Cable",
  "Chemical (Basic)": "Químicos (Básicos)",
  "Chemical (Diversified)": "Químicos (Diversificados)",
  "Chemical (Specialty)": "Químicos (Especializados)",
  "Coal & Related Energy": "Carbón y Energía Relacionada",
  "Computer Services": "Servicios Informáticos",
  "Computers/Peripherals": "Computadoras y Periféricos",
  "Construction Supplies": "Suministros de Construcción",
  Diversified: "Diversificado",
  "Drugs (Biotechnology)": "Fármacos (Biotecnología)",
  "Drugs (Pharmaceutical)": "Fármacos (Farmacéuticos)",
  Education: "Educación",
  "Electrical Equipment": "Equipos Eléctricos",
  "Electronics (Consumer & Office)": "Electrónica (Consumo y Oficina)",
  "Electronics (General)": "Electrónica (General)",
  "Engineering/Construction": "Ingeniería/Construcción",
  Entertainment: "Entretenimiento",
  "Environmental & Waste Services": "Servicios Ambientales y de Residuos",
  "Farming/Agriculture": "Agricultura",
  "Financial Svcs. (Non-bank & Insurance)":
    "Servicios Financieros (No Bancarios y Seguros)",
  "Food Processing": "Procesamiento de Alimentos",
  "Food Wholesalers": "Mayoristas de Alimentos",
  "Furn/Home Furnishings": "Muebles y Equipamiento del Hogar",
  "Green & Renewable Energy": "Energía Verde y Renovable",
  "Healthcare Products": "Productos de Salud",
  "Healthcare Support Services": "Servicios de Apoyo en Salud",
  "Heathcare Information and Technology": "Tecnología e Información en Salud",
  Homebuilding: "Construcción de Viviendas",
  "Hospitals/Healthcare Facilities": "Hospitales e Instalaciones de Salud",
  "Hotel/Gaming": "Hotelería y Juegos",
  "Household Products": "Productos para el Hogar",
  "Information Services": "Servicios de Información",
  "Insurance (General)": "Seguros (General)",
  "Insurance (Life)": "Seguros de Vida",
  "Insurance (Prop/Cas.)": "Seguros (Propiedad y Accidentes)",
  "Investments & Asset Management": "Inversiones y Gestión de Activos",
  Machinery: "Maquinaria",
  "Metals & Mining": "Metales y Minería",
  "Office Equipment & Services": "Equipos y Servicios de Oficina",
  "Oil/Gas (Integrated)": "Petróleo y Gas (Integrado)",
  "Oil/Gas (Production and Exploration)":
    "Petróleo y Gas (Producción y Exploración)",
  "Oil/Gas Distribution": "Distribución de Petróleo y Gas",
  "Oilfield Svcs/Equip.": "Servicios y Equipos Petroleros",
  "Packaging & Container": "Empaques y Contenedores",
  "Paper/Forest Products": "Papel y Productos Forestales",
  Power: "Energía Eléctrica",
  "Precious Metals": "Metales Preciosos",
  "Publishing & Newspapers": "Editoriales y Periódicos",
  "R.E.I.T.": "REIT (Fideicomisos de Inversión Inmobiliaria)",
  "Real Estate (Development)": "Bienes Raíces (Desarrollo)",
  "Real Estate (General/Diversified)": "Bienes Raíces (General/Diversificado)",
  "Real Estate (Operations & Services)":
    "Bienes Raíces (Operaciones y Servicios)",
  Recreation: "Recreación",
  Reinsurance: "Reaseguros",
  "Restaurant/Dining": "Restaurantes",
  "Retail (Automotive)": "Retail (Automotriz)",
  "Retail (Building Supply)": "Retail (Materiales de Construcción)",
  "Retail (Distributors)": "Retail (Distribuidores)",
  "Retail (General)": "Retail (General)",
  "Retail (Grocery and Food)": "Retail (Alimentos y Supermercados)",
  "Retail (Online)": "Retail (En Línea)",
  "Retail (REITs)": "Retail (REITs)",
  "Retail (Special Lines)": "Retail (Especializado)",
  "Rubber& Tires": "Caucho y Neumáticos",
  Semiconductor: "Semiconductores",
  "Semiconductor Equip": "Equipos de Semiconductores",
  "Shipbuilding & Marine": "Construcción Naval y Marina",
  Shoe: "Calzado",
  "Software (Entertainment)": "Software (Entretenimiento)",
  "Software (Internet)": "Software (Internet)",
  "Software (System & Application)": "Software (Sistemas y Aplicaciones)",
  Steel: "Acero",
  "Telecom (Wireless)": "Telecomunicaciones (Inalámbricas)",
  "Telecom. Equipment": "Equipos de Telecomunicaciones",
  "Telecom. Services": "Servicios de Telecomunicaciones",
  Tobacco: "Tabaco",
  Transportation: "Transporte",
  "Transportation (Railroads)": "Transporte (Ferrocarriles)",
  Trucking: "Transporte por Camión",
  "Utility (General)": "Servicios Públicos (General)",
  "Utility (Water)": "Servicios Públicos (Agua)",
};
