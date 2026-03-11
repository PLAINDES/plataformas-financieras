// src/features/landing/layout/FooterEditModal.tsx
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterContent {
  sections: FooterSection[];
  copyright: string;
}

interface FooterEditModalProps {
  open: boolean;
  content: FooterContent;
  onClose: () => void;
  onSave: (updated: FooterContent) => Promise<void>;
}

export function FooterEditModal({
  open,
  content,
  onClose,
  onSave,
}: FooterEditModalProps) {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [copyright, setCopyright] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && content) {
      setSections(
        (content.sections ?? []).map((s, si) => ({
          id: (s as any).id ?? `section-${si}`,
          title: s.title,
          links: (s.links ?? []).map((l, li) => ({
            id: (l as any).id ?? `link-${si}-${li}`,
            label: l.label,
            url: l.url,
          })),
        }))
      );
      setCopyright(content.copyright ?? "");
      setExpandedSection(null);
    }
  }, [open]);

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    setSections((prev) => [...prev, { id: newId, title: "", links: [] }]);
    setExpandedSection(newId);
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (expandedSection === id) setExpandedSection(null);
  };

  const updateSectionTitle = (id: string, value: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: value } : s))
    );
  };

  const addLink = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: [
                ...s.links,
                { id: `link-${Date.now()}`, label: "", url: "" },
              ],
            }
          : s
      )
    );
  };

  const deleteLink = (sectionId: string, linkId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, links: s.links.filter((l) => l.id !== linkId) }
          : s
      )
    );
  };

  const updateLink = (
    sectionId: string,
    linkId: string,
    field: "label" | "url",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: s.links.map((l) =>
                l.id === linkId ? { ...l, [field]: value } : l
              ),
            }
          : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ sections, copyright });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Pencil size={14} className="text-muted-foreground" />
            Editar Footer
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-3">
          {sections.map((section) => {
            const isOpen = expandedSection === section.id;
            return (
              <div
                key={section.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40">
                  <button
                    onClick={() =>
                      setExpandedSection(isOpen ? null : section.id)
                    }
                    className="flex items-center gap-1.5 flex-1 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown
                        size={13}
                        className="text-muted-foreground"
                      />
                    ) : (
                      <ChevronRight
                        size={13}
                        className="text-muted-foreground"
                      />
                    )}
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateSectionTitle(section.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Título de sección"
                      className="h-7 text-xs font-semibold uppercase tracking-wide border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:normal-case placeholder:font-normal"
                    />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-red-500 shrink-0"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>

                {isOpen && (
                  <div className="px-3 py-2 space-y-2">
                    {section.links.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-1">
                        Sin links todavía.
                      </p>
                    )}

                    {section.links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 group"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">
                              Texto
                            </Label>
                            <Input
                              value={link.label}
                              onChange={(e) =>
                                updateLink(
                                  section.id,
                                  link.id,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Contacto"
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">
                              URL
                            </Label>
                            <Input
                              value={link.url}
                              onChange={(e) =>
                                updateLink(
                                  section.id,
                                  link.id,
                                  "url",
                                  e.target.value
                                )
                              }
                              placeholder="/contacto"
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mt-4 text-muted-foreground hover:text-red-500 shrink-0"
                          onClick={() => deleteLink(section.id, link.id)}
                        >
                          <Trash2 size={11} />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground border border-dashed border-border w-full mt-1"
                      onClick={() => addLink(section.id)}
                    >
                      <Plus size={11} />
                      Agregar link
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed gap-1.5 text-muted-foreground"
            onClick={addSection}
          >
            <Plus size={13} />
            Agregar sección
          </Button>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Copyright
            </Label>
            <Input
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              placeholder="© 2026 Mi Empresa. Todos los derechos reservados."
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
