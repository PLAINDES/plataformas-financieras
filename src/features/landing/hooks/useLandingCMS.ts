// src/features/landing/hooks/useLandingCMS.ts
import { useAuthContext } from '@/features/auth/hooks/useAuthContext'; // Ajusta ruta si es necesario
import { cmsService } from '@/shared/services/cms.service';
import type { LandingDataResponse } from '@/shared/types';
import type { EditableContent, EditableCollectionData, CollectionItem } from '@shared/types/editable.types';

export function useLandingCMS(
  data: LandingDataResponse | null, 
  onRefresh: () => void,
  findContent: (slug: string) => any // Recibimos el helper del otro hook
) {
  const { getToken } = useAuthContext();

  // --- Helpers Privados ---
  const getContentIdFromEditable = (editable: EditableContent): number | null => {
    if (!data) return null;
    const content = findContent(`${editable.section}-home`) || findContent(editable.section);
    return content ? content.id : null;
  };

  const getFieldName = (editableId: string): string => {
    const parts = editableId.split('_');
    return parts[parts.length - 1];
  };

  // --- Acción: Guardar campo simple ---
  const handleSaveContent = async (editableContent: EditableContent) => {
    const token = getToken();
    if (!token) return console.error('No token available');

    try {
      const contentId = getContentIdFromEditable(editableContent);
      if (!contentId) throw new Error(`Content ID not found for ${editableContent.section}`);

      // Obtenemos la data actual para no perder otros campos
      const contentObj = findContent(`${editableContent.section}-home`) || findContent(editableContent.section);
      const currentData = contentObj?.data || {};
      const fieldName = getFieldName(editableContent.id);

      const updatedData = {
        ...currentData,
        [fieldName]: editableContent.value,
      };

      await cmsService.updateContent(
        contentId,
        { data: updatedData, status: 'published' },
        token
      );

      onRefresh(); // Recarga la UI
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  };

  // --- Acción: Guardar Colecciones (La lógica pesada) ---
  const handleSaveCollection = async <T extends CollectionItem>(
    collectionData: EditableCollectionData<T>
  ) => {
    const token = getToken();
    if (!token) return console.error('No token available');

    try {
      console.log('Saving collection:', collectionData);
      
      // Helper interno para buscar y validar existencia
      const getTargetContent = (slug: string) => {
        const c = findContent(slug);
        if (!c) throw new Error(`${slug} content not found`);
        return c;
      };

      switch (collectionData.section) {
        case 'products': {
          const content = getTargetContent("products");
          const categoryId = collectionData.id === 'products-kapital' ? 'cat-kapital' : 'cat-valora';
          
          const updatedCategories = content.data.categories.map((cat: any) => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                products: collectionData.items.map((item: any) => {
                  const { contentId, order, ...rest } = item;
                  return rest;
                })
              };
            }
            return cat;
          });

          await cmsService.updateContent(content.id, { 
            data: { ...content.data, categories: updatedCategories }, 
            status: 'published' 
          }, token);
          break;
        }

        case 'platforms': {
          const content = getTargetContent("platforms");
          const updatedData = {
            ...content.data,
            items: collectionData.items.map((item: any) => {
              const { contentId, order, title, ...rest } = item;
              return rest; // Nota: Revisar si title vs name es necesario mantener
            })
          };
          await cmsService.updateContent(content.id, { data: updatedData, status: 'published' }, token);
          break;
        }

        case 'clients': {
          const content = getTargetContent("clients");
          const updatedData = {
            ...content.data,
            logos: collectionData.items.map((item: any) => {
              const { contentId, order, ...rest } = item;
              return rest;
            })
          };
          await cmsService.updateContent(content.id, { data: updatedData, status: 'published' }, token);
          break;
        }

        case 'team': {
          const content = getTargetContent("team");
          let fieldName = '';
          if (collectionData.id === 'team-authors') fieldName = 'authors';
          else if (collectionData.id === 'team-developmentTeam') fieldName = 'developmentTeam';
          else if (collectionData.id === 'team-collaborators') fieldName = 'collaborators';
          
          if (!fieldName) throw new Error('Unknown team collection');

          const updatedData = {
            ...content.data,
            [fieldName]: collectionData.items.map((item: any) => {
              const { contentId, order, ...rest } = item;
              return rest;
            })
          };
          await cmsService.updateContent(content.id, { data: updatedData, status: 'published' }, token);
          break;
        }

        default:
          console.warn(`Unknown collection section: ${collectionData.section}`);
          return;
      }

      console.log('Collection updated successfully');
      onRefresh();
      
    } catch (error) {
      console.error('Error saving collection:', error);
      throw error;
    }
  };

  return { handleSaveContent, handleSaveCollection };
}
