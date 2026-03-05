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

  const menuItems: MenuItem[] = data?.menus?.header_landing?.items.map(item => ({
    id: item.id,
    name: item.title,
    slug: item.slug ?? item.title.toLowerCase().replace(/\s+/g, '-'),
    visible: item.is_visible,
    target: item.target ?? '_self',
    order: item.order ?? 0
  })) ?? [];

  const findContent = (slug: string) => {
    return data?.page.contents.find(c => c.slug === slug);
  };

  const getContentData = (slug: string) => {
    return findContent(slug)?.data;
  };

  const updateContentLocally = (slug: string, newData: any) => {
  setData(prev => {
    if (!prev) return prev;

    return {
      ...prev,
      page: {
        ...prev.page,
        contents: prev.page.contents.map(content =>
          content.slug === slug
            ? { ...content, data: newData }
            : content
        )
      }
    };
  });
};


  return {
    data,
    loading,
    menuItems,
    refresh: loadData,
    findContent,   
    getContentData,
    updateContentLocally  
  };
}