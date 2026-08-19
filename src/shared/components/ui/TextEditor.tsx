import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useState, useCallback, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { FontSize, FontFamilyExtension } from "./ConfigTextEditor";
import { sanitizeOfficePaste } from "@/shared/utils/officePasteSanitizer";

const StyledTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) =>
          (element as HTMLElement).style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width}`,
          };
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) =>
          (element as HTMLElement).style.verticalAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {};
          return {
            style: `vertical-align: ${attributes.verticalAlign}`,
          };
        },
      },
      border: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.border || null,
        renderHTML: (attributes) => {
          if (!attributes.border) return {};
          return {
            style: `border: ${attributes.border}`,
          };
        },
      },
    };
  },
});

const StyledTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) =>
          (element as HTMLElement).style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width}`,
          };
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) =>
          (element as HTMLElement).style.verticalAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {};
          return {
            style: `vertical-align: ${attributes.verticalAlign}`,
          };
        },
      },
      border: {
        default: null,
        parseHTML: (element) => (element as HTMLElement).style.border || null,
        renderHTML: (attributes) => {
          if (!attributes.border) return {};
          return {
            style: `border: ${attributes.border}`,
          };
        },
      },
    };
  },
});

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

interface FontSizeSelectProps {
  value: string;
  onChange: (v: string) => void;
}

interface ColorPickerProps {
  value: string;
  onChange: (v: string) => void;
  title: string;
  icon: React.ReactNode;
}

const FONT_SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "28",
  "32",
  "36",
  "48",
  "72",
];
const FONT_FAMILIES = [
  "sans-serif",
  "serif",
  "monospace",
  "Georgia",
  "Arial",
  "Courier New",
  "Times New Roman",
];

const DEFAULT_CONTENT = `<h2 style="text-align: left"><strong>1. INTRODUCCIÓN</strong></h2>
<p style="text-align: justify">El presente reporte contiene los resultados de la estimación del costo de capital de la empresa, además de una explicación de la metodología utilizada. El proceso de estimación tiene tres etapas. Primero, se realiza una estimación del costo de capital en un mercado desarrollado en base al sector al que pertenece la empresa. Segundo, se ajusta dicha estimación para reflejar el riesgo del país en el que opera principalmente la empresa. Y tercero, se realiza un conjunto de ajustes finales para reflejar el nivel de apalancamiento financiero de la empresa, la divisa en la que quiere expresarse la tasa, y otros riesgos que pueda enfrentar la empresa.</p>
<p style="text-align: justify">A continuación, se describe en detalle estas tres etapas, mostrando los resultados obtenidos en cada caso.</p>
<h2 style="text-align: left"><strong>2. COSTO DE CAPITAL EN UN MERCADO DESARROLLADO</strong></h2>
<p style="text-align: justify">La primera etapa consiste en estimar el costo de capital en un mercado desarrollado de referencia. La característica de "desarrollado" se refiere al nivel de liquidez, representatividad, e historial estadístico de sus mercados bursátiles. Esto es sumamente importante, pues la información obtenida de los mercados bursátiles es la base para una correcta estimación.</p>`;

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={[
      "flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition-all",
      active
        ? "bg-blue-100 text-blue-700 shadow-inner"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
    ].join(" ")}
  >
    {children}
  </button>
);

const FontSizeSelect: React.FC<FontSizeSelectProps> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-7 w-14 rounded border border-slate-200 bg-white px-1 text-[11px] text-slate-700 focus:border-blue-400 focus:outline-none"
  >
    {FONT_SIZES.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
);

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  title,
  icon,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        onClick={() => inputRef.current?.click()}
        className="flex h-7 w-7 flex-col items-center justify-center rounded transition-all hover:bg-slate-100"
      >
        <span className="text-xs font-bold leading-none text-slate-700">
          {icon}
        </span>
        <span
          className="mt-0.5 h-1 w-4 rounded-sm"
          style={{ backgroundColor: value }}
        />
      </button>
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute left-0 top-0 h-full w-full opacity-0"
        style={{ pointerEvents: "all" }}
      />
    </div>
  );
};

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = DEFAULT_CONTENT,
  onChange,
}) => {
  const [, setUpdateState] = useState({});

  const [fontSize, setFontSize] = useState("13");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textColor, setTextColor] = useState("#f7c400");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      FontFamilyExtension,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph", "tableCell", "tableHeader"],
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      StyledTableHeader,
      StyledTableCell,
      Subscript,
      Superscript,
    ],
    content: initialContent,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    onTransaction({ editor }) {
      // Fuerza a React a evaluar isActive() en los botones
      setUpdateState({});

      // Sincroniza los valores de los selects/color pickers con el texto seleccionado
      const attrs = editor.getAttributes("textStyle");
      if (attrs.fontSize) {
        // Extrae el número quitando "pt" o "px"
        const size = attrs.fontSize.replace(/[^0-9.]/g, "");
        setFontSize(size);
      }
      if (attrs.fontFamily) setFontFamily(attrs.fontFamily);

      const currentTextColor = editor.getAttributes("textStyle").color;
      if (currentTextColor) setTextColor(currentTextColor);

      const currentHighlight = editor.getAttributes("highlight").color;
      if (currentHighlight) setHighlightColor(currentHighlight);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-5 text-slate-800 leading-relaxed",
      },
      transformPastedHTML(html) {
        return sanitizeOfficePaste(html);
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const token = event.dataTransfer?.getData("text/plain");
        if (!token) return false;

        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords);
        if (!pos) return false;

        view.dispatch(view.state.tr.insertText(token, pos.pos));
        event.preventDefault();
        return true;
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt("URL de la imagen");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const applyFontSize = useCallback(
    (size: string) => {
      setFontSize(size);
      editor
        ?.chain()
        .focus()
        .setMark("textStyle", { fontSize: `${size}pt` })
        .run();
    },
    [editor]
  );

  const applyFontFamily = useCallback(
    (family: string) => {
      setFontFamily(family);
      editor
        ?.chain()
        .focus()
        .setMark("textStyle", { fontFamily: family })
        .run();
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Deshacer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Rehacer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
            </svg>
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negrita"
          >
            <strong className="text-[13px]">B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Cursiva"
          >
            <em className="text-[13px]">I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Subrayado"
          >
            <span className="text-[13px] underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Tachado"
          >
            <span className="text-[13px] line-through">S</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
            title="Subíndice"
          >
            <span className="text-[11px]">
              X<sub>2</sub>
            </span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
            title="Superíndice"
          >
            <span className="text-[11px]">
              X<sup>2</sup>
            </span>
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <select
            value={fontFamily}
            onChange={(e) => applyFontFamily(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-white px-1 text-[11px] text-slate-700 focus:border-blue-400 focus:outline-none"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <FontSizeSelect value={fontSize} onChange={applyFontSize} />

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ColorPicker
            value={textColor}
            onChange={(c) => {
              setTextColor(c);
              editor.chain().focus().setColor(c).run();
            }}
            title="Color de texto"
            icon="A"
          />
          <ColorPicker
            value={highlightColor}
            onChange={(c) => {
              setHighlightColor(c);
              editor.chain().focus().toggleHighlight({ color: c }).run();
            }}
            title="Resaltar"
            icon={
              <span style={{ background: "#ff0", padding: "0 2px" }}>A</span>
            }
          />

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Lista"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().sinkListItem("listItem").run()
            }
            disabled={!editor.can().sinkListItem("listItem")}
            title="Aumentar sangría"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M3 21h18v-2H3v2zm0-2h18v-2H3v2zM3 5v14h18V5H3zm2 12V7h14v10H5zm-2-4h18v-2H3v2z" />
            </svg>
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Alinear izquierda"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Centrar"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Alinear derecha"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="Justificar"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
            </svg>
          </ToolbarButton>
        </div>

        <div className="flex flex-wrap items-center gap-0.5 border-t border-slate-100 px-2 py-1">
          <ToolbarButton onClick={insertTable} title="Insertar tabla">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H5V5h15zm-9 5h4v4h-4v-4zm0 9v-3h4v3h-4zM5 10h4v4H5v-4zm0 6v-3h4v3H5zm11-6h4v4h-4v-4zm0 6v-3h4v3h-4z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            title="Insertar enlace"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} title="Insertar imagen">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Línea horizontal"
          >
            <span className="text-[13px] font-light">—</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const html = editor.getHTML();
              const w = window.open("", "_blank");
              if (w)
                w.document.write(`<pre>${html.replace(/</g, "&lt;")}</pre>`);
            }}
            title="Ver HTML"
          >
            <span className="font-mono text-[10px]">&lt;/&gt;</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => window.print()} title="Ayuda">
            <span className="text-[13px]">?</span>
          </ToolbarButton>
        </div>
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-1 shadow-lg"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negrita"
          >
            <strong className="text-[12px]">B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Cursiva"
          >
            <em className="text-[12px]">I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Subrayado"
          >
            <span className="text-[12px] underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            title="Enlace"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          </ToolbarButton>
        </BubbleMenu>
      )}

      <div className="rounded-b-xl overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror h2 {
          font-size: 0.875rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          color: #1e293b;
        }
        .ProseMirror p {
          margin: 0.4rem 0;
          font-size: 0.8125rem;
          color: #334155;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.75rem 0;
        }
        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #cbd5e1;
          padding: 4px 8px;
          font-size: 0.75rem;
          position: relative;
        }
        .ProseMirror th {
          background: #f1f5f9;
          font-weight: 600;
        }
        .ProseMirror .selectedCell::after {
          background: rgba(59,130,246,0.15);
          content: "";
          inset: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .ProseMirror ul { list-style: disc; padding-left: 1.25rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.25rem; }
        .ProseMirror li { font-size: 0.8125rem; margin: 0.2rem 0; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; }
        .ProseMirror hr { border: none; border-top: 1px solid #e2e8f0; margin: 0.75rem 0; }
        .ProseMirror blockquote {
          border-left: 3px solid #cbd5e1;
          padding-left: 0.75rem;
          color: #64748b;
          font-style: italic;
        }
        .ProseMirror code {
          background: #f1f5f9;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.75rem;
          padding: 1px 4px;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
