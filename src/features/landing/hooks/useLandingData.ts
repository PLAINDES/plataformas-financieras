// src/features/landing/hooks/useLandingData.ts
import { useState, useEffect, useCallback } from "react";
import { cmsService } from "@/shared/services/cms.service";
import type { LandingDataResponse, MenuItem } from "@/shared/types";

export function useLandingData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LandingDataResponse | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    cmsService
      .getLandingData()
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading landing data", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const findContent = (slug: string) =>
    (data?.page as any)?.contents?.find((c: any) => c.slug === slug);

  const getContentData = (slug: string) => findContent(slug)?.data;

  const menuItems: MenuItem[] = (
    getContentData("header-principal")?.item_header ?? []
  ).map((item: { title: string }, index: number) => ({
    id: index,
    name: item.title,
    slug: item.title.toLowerCase().replace(/\s+/g, "-"),
    visible: true,
    target: "_self" as const,
    order: index,
  }));

  const updateContentLocally = (slug: string, newData: any) => {
    setData((prev) => {
      if (!prev) return prev;
      const prevPage = prev.page as any;
      return {
        ...prev,
        page: {
          ...prevPage,
          contents: (prevPage.contents ?? []).map((content: any) =>
            content.slug === slug ? { ...content, data: newData } : content
          ),
        },
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
    updateContentLocally,
  };
}
