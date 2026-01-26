// types/editable.types.ts
export interface EditableContent {
  id: string;
  type: 'text' | 'richtext';
  value: string;
  section: string;
}
