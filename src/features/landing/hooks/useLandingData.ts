// src/features/landing/hooks/useLandingData.ts
import { useState, useEffect, useCallback } from 'react';
import { cmsService } from '@/shared/services/cms.service';
import type { LandingDataResponse, MenuItem } from '@/shared/types';

export function useLandingData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LandingDataResponse | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    cmsService.getLandingData()
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading landing data", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lógica de transformación del menú (sacada de la vista)
  const menuItems: MenuItem[] = data?.menus?.header_landing?.items.map(item => ({
    id: item.id,
    name: item.title,
    slug: item.slug ?? item.title.toLowerCase().replace(/\s+/g, '-'),
    visible: item.is_visible,
    target: item.target ?? '_self',
    order: item.order ?? 0
  })) ?? [];

  // Helper optimizado para buscar contenido
  const findContent = (slug: string) => {
    return data?.page.contents.find(c => c.slug === slug);
  };

  // Helper para sacar directamente la data (ahorra código en la vista)
  const getContentData = (slug: string) => {
    return findContent(slug)?.data;
  };

  return {
    data,
    loading,
    menuItems,
    refresh: loadData,
    findContent,    // Devuelve el objeto completo (id, slug, data)
    getContentData  // Devuelve solo content.data (lo que usa la UI)
  };
}