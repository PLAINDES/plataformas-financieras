// src/App.tsx

import { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './app/landing/LandingPage';
import { useAuth } from './hooks/useAuth';
import { cmsService } from './services/cms.service';
import type { Company, MenuItem, LandingData } from './types';
import type { SectionResponse } from './types';
import './styles/global.css';

// Mock data inicial (reemplazar con datos del backend)
const INITIAL_COMPANY: Company = {
  id: 1,
  name: 'Plataforma Finanzas',
  host: 'https://kapitals.org',
  logos: [
    { id: 1, patch: '/images/logo.png', type: 'default' },
    { id: 2, patch: '/images/diseñador.png', type: 'sticky' },
  ],
};

const MOCK_SECTIONS: SectionResponse[] = [
  {
    id: 1,
    type: 'hero',
    order: 1,
    content: {
      title: 'Plataforma de Finanzas',
      description: 'Gestiona tus finanzas de forma inteligente',
    },
  },
];


const INITIAL_MENUS: MenuItem[] = [
  { id: 1, name: 'Plataformas', slug: 'plataformas', order: 1, visible: true },
  { id: 2, name: 'Beneficios', slug: 'beneficios', order: 2, visible: true },
  { id: 3, name: 'Productos', slug: 'productos', order: 3, visible: true },
  { id: 4, name: 'Equipo', slug: 'equipo', order: 4, visible: true },
  { id: 5, name: 'Contacto', slug: 'contacto', order: 5, visible: true },
];

function App() {
  const { user, logout, login, register, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENUS);
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLandingData();
  }, [user]);

  const loadLandingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar desde el backend
      try {
        const data = await cmsService.getLandingData();
        console.log('Landing data loaded from backend:', data);

/*
        setLandingData({ page: {id: 2, title: 'data.page'.title, slug: data.page.slug, 
                                description: data.page.description, status: data.page.status, is_homepage: data.page.is_homepage, 
                                meta_title: data.page.meta_title, meta_description: data.page.meta_description, 
                                created_at: data.page.created_at, updated_at: data.page.updated_at}, 
                          sections: data.sections, 
                          company, 
                          menus: menuItems });
                          */
      } catch (err) {
        console.warn('No se pudo cargar desde el backend, usando datos mock:', err);
        // Usar datos mock si el backend no está disponible
        setError('Usando configuración local. El servidor no está disponible.');
      }
    } catch (err) {
      console.error('Error loading landing data:', err);
      setError('Error al cargar los datos. Usando configuración por defecto.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Recargar datos sin usuario
      loadLandingData();
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const handleRegister = async (data: {
    name: string;
    lastname: string;
    email: string;
    password: string;
  }) => {
    try {
      await register(data);
      loadLandingData();
    } catch (err) {
      console.error('Error during registration:', err);
      throw err;
    }
  };

  // Mostrar loading solo si auth está cargando
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      company={company}
      menuItems={menuItems}
      user={user}
      onLogout={handleLogout}
      onLogin={login}
      onRegister={handleRegister}
    >
      {error && (
        <div className="alert alert-warning " role="alert">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando contenido...</span>
          </div>
        </div>
      ) : (
       <LandingPage
  landingData={{
    page: {
      id: 1,
      title: 'Home',
      slug: '/',
      description: null,
      status: 'published',
      is_homepage: true,
      meta_title: null,
      meta_description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    sections: MOCK_SECTIONS,
    company,
    menus: menuItems,
  }}
  isAdmin={user?.role === 'admin'}
/>


      )}
    </MainLayout>
  );
}

export default App;