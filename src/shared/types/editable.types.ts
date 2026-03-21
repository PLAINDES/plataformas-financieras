// src/types/editable.types.ts

export interface EditableContent {
  id: string;
  type: "text" | "richtext" | "image" | "button";
  value: string;
  section: string;
}

export interface CollectionItem {
  id: string;
  order: number;
  [key: string]: any;
}

export interface EditableCollectionData<
  T extends CollectionItem = CollectionItem,
> {
  id: string;
  section?: string;
  type?: string;
  items: T[];
}

export interface VideoData {
  type: "upload" | "url";
  src: string;
  poster?: string;
  title?: string;
}

export interface LinkData {
  url: string;
  text: string;
  target?: "_blank" | "_self";
}

export interface CollectionActions<T extends CollectionItem> {
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onReorder: (items: T[]) => void;
  onSave: (data: EditableCollectionData<T>) => Promise<void>;
}
