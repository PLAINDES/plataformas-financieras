import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableText } from "@/shared/components/editable/EditableText";
import { EditableCollection } from "@/shared/components/editable/EditableCollection";
import type { EditableContent, EditableCollectionData, CollectionItem } from '@/shared/types/editable.types';
import { useAuthContext } from '../../auth/hooks/useAuthContext';

interface ClientLogoEditable extends CollectionItem {
  name: string;
  imageUrl: string;
  alt?: string;
}

interface ClientsSectionProps {
  content?: {
    title?: string;
    logos?: Array<{
      id: string | number;
      name: string;
      imageUrl: string;
      alt?: string;
    }>;
  };
  onSave?: (content: EditableContent) => Promise<void>;
  onSaveCollection?: <T extends CollectionItem>(data: EditableCollectionData<T>) => Promise<void>;
}

export function ClientsSection({ content = {}, onSave, onSaveCollection }: ClientsSectionProps) {
  const { isAdmin } = useAuthContext();
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);

  const [items, setItems] = useState<ClientLogoEditable[]>(() =>
    (content.logos || []).map((logo, index) => ({
      ...logo,
      id: String(logo.id),
      order: index,
    }))
  );

  useEffect(() => {
    if (content.logos) {
      setItems(content.logos.map((logo, index) => ({
        ...logo,
        id: String(logo.id),
        order: index,
      })));
    }
  }, [content.logos]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-client-logo]') && !target.closest('[data-client-controls]')) {
        setSelectedLogoId(null);
      }
    };
    if (isAdmin && selectedLogoId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isAdmin, selectedLogoId]);

  const handleSaveClients = async (data: EditableCollectionData<ClientLogoEditable>) => {
    const previousItems = items;
    setItems(data.items);
    if (onSaveCollection) {
      try {
        await onSaveCollection({ ...data, id: 'clients-logos' });
      } catch (error) {
        setItems(previousItems);
      }
    }
  };

  const createNewClient = (): ClientLogoEditable => ({
    id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Nuevo Cliente',
    imageUrl: 'https://via.placeholder.com/140x40?text=Logo',
    alt: 'Logo del cliente',
    order: items.length,
  });

  const titleContent: EditableContent = {
    id: 'clients_title',
    type: 'text',
    value: content.title || 'Ellos confiaron en nosotros',
    section: 'clients',
  };

  if ((!items || items.length === 0) && !isAdmin) return null;

  return (
    <div className="py-10 md:py-16 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <EditableText
            content={titleContent}
            onSave={onSave || (async () => {})}
            as="h2"
            className="text-gray-400 mb-0 font-normal text-2xl md:text-4xl lg:text-4xl"
          />
        </div>

        <EditableCollection
          data={{ id: 'clients-logos', section: 'clients', items, type: 'collection' }}
          onSave={handleSaveClients}
          createNewItem={createNewClient}
          addButtonText="Agregar Cliente"
          emptyMessage="No hay clientes. Agrega uno para comenzar."
          allowReorder={true}
          maxItems={20}
          className="flex flex-wrap justify-center items-center gap-5 md:gap-8 px-3 md:px-5"
          renderItem={(client, index, helpers) => (
            <ClientLogoCard
              client={client}
              helpers={helpers}
              isSelected={selectedLogoId === client.id}
              onSelect={() => setSelectedLogoId(client.id)}
              onDeselect={() => setSelectedLogoId(null)}
            />
          )}
        />
      </div>
    </div>
  );
}

interface ClientLogoCardProps {
  client: ClientLogoEditable;
  helpers: any;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
}

function ClientLogoCard({ client, helpers, isSelected = false, onSelect, onDeselect }: ClientLogoCardProps) {
  const [editedClient, setEditedClient] = useState<ClientLogoEditable>(client);
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    if (!helpers.isEditing) setEditedClient(client);
  }, [client, helpers.isEditing]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    helpers.onSaveItem(editedClient);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedClient(client);
    helpers.onCancelEdit();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (!isAdmin) return;
    e.stopPropagation();
    isSelected ? onDeselect?.() : onSelect?.();
  };

  if (helpers.isEditing) {
    return (
      <div
        className="relative min-w-[280px] max-w-[320px] sm:min-w-full sm:max-w-full border border-slate-200 rounded-xl p-5 bg-white z-[100] shadow-2xl mb-4 sm:mb-0 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Editar Cliente</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Nombre de la empresa', field: 'name', placeholder: 'Ej: Microsoft' },
              { label: 'URL del Logo', field: 'imageUrl', placeholder: 'https://ejemplo.com/logo.png' },
              { label: 'Texto Alternativo (SEO)', field: 'alt', placeholder: 'Descripción de la imagen' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 ml-1">{label}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={(editedClient as any)[field] || ''}
                  onChange={(e) => setEditedClient({ ...editedClient, [field]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
            ))}

            {editedClient.imageUrl && (
              <div className="relative group mt-2">
                <p className="text-[10px] text-center text-slate-400 mb-1">Vista previa</p>
                <div className="flex items-center justify-center p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                  <img
                    src={editedClient.imageUrl}
                    alt="Preview"
                    className="max-h-[40px] w-auto object-contain filter drop-shadow-sm"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/140x40?text=Error+al+cargar'; }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs text-slate-600"
              onClick={handleCancelClick}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              onClick={handleSaveClick}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-client-logo
      className={`
        relative min-w-[70px] max-w-[140px] flex justify-center items-center
        transition-all duration-200
        ${isAdmin ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg p-1' : ''}
      `}
      title={client.name}
      onClick={handleLogoClick}
    >
      <img
        src={client.imageUrl}
        alt={client.alt || client.name}
        className={`
          max-h-[22px] md:max-h-[30px] lg:max-h-[35px] w-auto object-contain
          grayscale brightness-85 opacity-40
          transition-all duration-300
          hover:grayscale-0 hover:brightness-100 hover:opacity-60 hover:scale-110
          ${isSelected ? 'grayscale-0 brightness-100 opacity-80 scale-110' : ''}
        `}
        onError={(e) => { e.currentTarget.src = 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg'; }}
      />

      {isAdmin && isSelected && (
        <div
          data-client-controls
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex gap-1 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {helpers.canMoveUp && (
            <Button variant="ghost" size="icon" className="w-7 h-7" title="Mover arriba"
              onClick={(e) => { e.stopPropagation(); helpers.onMoveUp?.(); }}
            >
              <ChevronUp className="w-4 h-4 text-gray-600" />
            </Button>
          )}
          {helpers.canMoveDown && (
            <Button variant="ghost" size="icon" className="w-7 h-7" title="Mover abajo"
              onClick={(e) => { e.stopPropagation(); helpers.onMoveDown?.(); }}
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </Button>
          )}
          {(helpers.canMoveUp || helpers.canMoveDown) && <div className="w-px h-6 bg-gray-300" />}
          <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-blue-50 group" title="Editar"
            onClick={(e) => { e.stopPropagation(); helpers.onEdit(); onDeselect?.(); }}
          >
            <Pencil className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-red-50 group" title="Eliminar"
            onClick={(e) => { e.stopPropagation(); helpers.onDelete(); onDeselect?.(); }}
          >
            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          </Button>
        </div>
      )}
    </div>
  );
}