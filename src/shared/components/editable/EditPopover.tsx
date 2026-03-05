// src/shared/components/editable/EditPopover.tsx
import { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface EditField {
  key: string;
  label: string;
  placeholder?: string;
  defaultValue: string;
}

interface EditPopoverProps {
  open: boolean;
  title?: string;
  fields: EditField[];
  onSave: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export function EditPopover({ open, title = 'Editar', fields, onSave, onCancel }: EditPopoverProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  // Reset values cuando se abre con nuevos fields
  useEffect(() => {
    if (open) {
      setValues(Object.fromEntries(fields.map(f => [f.key, f.defaultValue])));
    }
  }, [open, fields.map(f => f.defaultValue).join('|')]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs text-muted-foreground uppercase tracking-wider">
                {field.label}
              </Label>
              <Input
                id={field.key}
                autoFocus={field === fields[0]}
                value={values[field.key] ?? ''}
                onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="h-9 text-sm"
              />
            </div>
          ))}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─── Item Controls ────────────────────────────────────────────────────────────
// Botones inline que aparecen junto a cada item: editar, eliminar, subir, bajar

interface ItemControlsProps {
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  /** 'dark' para fondos oscuros (footer), 'light' para fondos claros (header) */
  theme?: 'dark' | 'light';
}

export function ItemControls({
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  theme = 'light',
}: ItemControlsProps) {
  const base = `h-6 w-6 p-0 transition-opacity ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700'}`;

  return (
    <span
      className="inline-flex items-center gap-0.5 ml-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150"
      onClick={(e) => e.preventDefault()}
    >
      {canMoveUp && (
        <Button variant="ghost" size="icon" className={base} onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }} title="Subir">
          <ChevronUp size={12} />
        </Button>
      )}
      {canMoveDown && (
        <Button variant="ghost" size="icon" className={base} onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }} title="Bajar">
          <ChevronDown size={12} />
        </Button>
      )}
      <Button variant="ghost" size="icon" className={base} onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Editar">
        <Pencil size={11} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${base} hover:!text-red-500 hover:!bg-red-50`}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Eliminar"
      >
        <Trash2 size={11} />
      </Button>
    </span>
  );
}


// ─── Add Button ───────────────────────────────────────────────────────────────
// Botón "+" para agregar un nuevo item a una colección

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  theme?: 'dark' | 'light';
}

export function AddButton({ onClick, label = 'Agregar', theme = 'light' }: AddButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`mt-2 h-7 gap-1 text-xs border border-dashed transition-colors ${
        theme === 'dark'
          ? 'border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5'
          : 'border-gray-300 text-gray-400 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <Plus size={12} />
      {label}
    </Button>
  );
}