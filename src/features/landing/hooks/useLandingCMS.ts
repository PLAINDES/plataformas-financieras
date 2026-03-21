// src/features/landing/hooks/useLandingCMS.ts
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { cmsService } from "@/shared/services/cms.service";
import type { LandingDataResponse } from "@/shared/types";
import type {
  EditableContent,
  EditableCollectionData,
  CollectionItem,
} from "@/shared/types/editable.types";

export function useLandingCMS(
  _data: LandingDataResponse | null,
  onLocalUpdate: (slug: string, newData: any) => void,
  findContent: (slug: string) => any
) {
  const { getToken, user } = useAuthContext();

  const getFieldName = (editableId: string): string =>
    editableId.split("_").at(-1)!;

  const save = (
    contentId: number,
    payload: { data: any; status?: "draft" | "published" }
  ) => {
    const token = getToken();
    if (!token) {
      console.error("No token available");
      return Promise.reject("No token");
    }
    return cmsService.updateContent(
      contentId,
      payload,
      token,
      user?.id ?? null
    );
  };

  const handleSaveContent = async (editableContent: EditableContent) => {
    try {
      const contentObj =
        findContent(`${editableContent.section}-home`) ||
        findContent(editableContent.section);
      if (!contentObj)
        throw new Error(`Content not found for ${editableContent.section}`);

      const updatedData = {
        ...contentObj.data,
        [getFieldName(editableContent.id)]: editableContent.value,
      };
      await save(contentObj.id, { data: updatedData, status: "published" });
      onLocalUpdate(contentObj.slug, updatedData);
    } catch (error) {
      console.error("Error saving content:", error);
      throw error;
    }
  };

  const handleSaveMenuItems = async (items: { title: string }[]) => {
    try {
      const contentObj = findContent("header-principal");
      if (!contentObj) throw new Error("header-principal content not found");

      const updatedData = { ...contentObj.data, item_header: items };
      await save(contentObj.id, { data: updatedData, status: "published" });
      onLocalUpdate("header-principal", updatedData);
    } catch (error) {
      console.error("Error saving menu items:", error);
      throw error;
    }
  };

  const handleSaveFooter = async (updatedFooter: any) => {
    try {
      const contentObj = findContent("main-footer");
      if (!contentObj) throw new Error("main-footer content not found");

      await save(contentObj.id, { data: updatedFooter, status: "published" });
      onLocalUpdate("main-footer", updatedFooter);
    } catch (error) {
      console.error("Error saving footer:", error);
      throw error;
    }
  };

  const handleSaveCollection = async <T extends CollectionItem>(
    collectionData: EditableCollectionData<T>
  ) => {
    try {
      let content: any = null;
      let updatedData: any = null;

      const getTargetContent = (slug: string) => {
        const c = findContent(slug);
        if (!c) throw new Error(`${slug} content not found`);
        return c;
      };

      switch (collectionData.section) {
        case "products": {
          content = getTargetContent("products");
          const categoryId =
            collectionData.id === "products-kapital"
              ? "cat-kapital"
              : "cat-valora";
          updatedData = {
            ...content.data,
            categories: content.data.categories.map((cat: any) =>
              cat.id === categoryId
                ? {
                    ...cat,
                    products: collectionData.items.map(
                      ({ contentId, order, ...rest }: any) => rest
                    ),
                  }
                : cat
            ),
          };
          break;
        }
        case "platforms": {
          content = getTargetContent("platforms");
          updatedData = {
            ...content.data,
            items: collectionData.items.map(
              ({ contentId, order, title, ...rest }: any) => rest
            ),
          };
          break;
        }
        case "clients": {
          content = getTargetContent("clients");
          updatedData = {
            ...content.data,
            logos: collectionData.items.map(
              ({ contentId, order, ...rest }: any) => rest
            ),
          };
          break;
        }
        case "team": {
          content = getTargetContent("team");
          const fieldMap: Record<string, string> = {
            "team-authors": "authors",
            "team-developmentTeam": "developmentTeam",
            "team-collaborators": "collaborators",
          };
          const fieldName = fieldMap[collectionData.id];
          if (!fieldName) throw new Error("Unknown team collection");
          updatedData = {
            ...content.data,
            [fieldName]: collectionData.items.map(
              ({ contentId, order, ...rest }: any) => rest
            ),
          };
          break;
        }
        default:
          console.warn(`Unknown collection section: ${collectionData.section}`);
          return;
      }

      await save(content.id, { data: updatedData, status: "published" });
      onLocalUpdate(content.slug, updatedData);
    } catch (error) {
      console.error("Error saving collection:", error);
      throw error;
    }
  };

  return {
    handleSaveContent,
    handleSaveMenuItems,
    handleSaveFooter,
    handleSaveCollection,
  };
}
