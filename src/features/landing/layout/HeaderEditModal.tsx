// src/features/landing/layout/HeaderEditModal.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderMenuItem {
  id: string;
  title: string;
}

function SortableMenuItem({ item, onDelete, onTitleChange}: {
  item: HeaderMenuItem;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-background transition-colors ${isDragging ? 'border-blue-400 shadow-lg' : 'border-border hover:border-muted-foreground/30'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none p-0.5"
        tabIndex={-1}
      >
        <GripVertical size={15} />
      </button>

      <Input
        value={item.title}
        onChange={(e) => onTitleChange(item.id, e.target.value)}
        placeholder="Nombre del item"
        className="h-8 text-sm flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
      />

      <button
        onClick={() => onDelete(item.id)}
        className="p-1 rounded text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
        title="Eliminar"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}


interface HeaderEditModalProps {
  open: boolean;
  items: HeaderMenuItem[];
  onClose: () => void;
  onSave: (items: { title: string }[]) => Promise<void>;
}

export function HeaderEditModal({ open, items, onClose, onSave }: HeaderEditModalProps) {
  const [localItems, setLocalItems] = useState<HeaderMenuItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalItems(items.map((item, i) => ({ ...item, id: item.id ?? `item-${i}` })));
    }
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalItems((prev) => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleAdd = () => {
    const newItem = { id: `new-${Date.now()}`, title: '' };
    setLocalItems(prev => [...prev, newItem]);
  };

  const handleDelete = (id: string) => {
    setLocalItems(prev => prev.filter(i => i.id !== id));
  };

  const handleTitleChange = (id: string, value: string) => {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, title: value } : i));
  };

  const handleSave = async () => {
    const valid = localItems.filter(i => i.title.trim());
    setSaving(true);
    try {
      await onSave(valid.map(({ title }) => ({ title })));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[420px] max-h-[80vh] flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Pencil size={13} className="text-muted-foreground" />
            Editar menú de navegación
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {localItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay items. Agrega uno para empezar.
            </p>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {localItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onTitleChange={handleTitleChange}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleAdd}
        >
          <Plus size={13} />
          Agregar item
        </Button>

        <div className="flex justify-end gap-2 pt-1 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}