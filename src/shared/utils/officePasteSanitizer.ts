// Sanitiza el HTML pegado desde Word/Google Docs/OneDrive para que TipTap
// conserve el formato (centrado, tamaños de fuente, tablas con bordes y
// colores) en lugar de degradarlo a texto plano.

const PX_PER_PT = 96 / 72;
const COLOR_KEYWORDS: Record<string, string> = {
  windowtext: "#000000",
  black: "#000000",
  white: "#ffffff",
};

function applyPx(declValue: string): string {
  return declValue.replace(
    /(\d+(?:\.\d+)?)\s*pt\b/gi,
    (_m, n: string) => `${Math.round(parseFloat(n) * PX_PER_PT)}px`
  );
}

function normalizeColor(value: string): string {
  let v = (value || "").trim();
  v = v.replace(/^mso-/, "");
  const kw = COLOR_KEYWORDS[v.toLowerCase()];
  return kw ?? v;
}

// Aplica las reglas CSS simples de las etiquetas <style> de Office como
// estilos inline, para que ProseMirror no las descarte al parsear el DOM.
function inlineStylesFromStyleTags(doc: Document) {
  const styleTags = Array.from(doc.querySelectorAll("style"));
  for (const tag of styleTags) {
    const css = tag.textContent || "";
    const ruleRe = /([^{}@]+)\{([^}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRe.exec(css)) !== null) {
      const selector = m[1].trim();
      const decl = m[2].trim();
      if (!selector || selector.startsWith("@") || selector.includes(":")) {
        continue;
      }
      let targets: NodeListOf<Element>;
      try {
        targets = doc.querySelectorAll(selector);
      } catch {
        continue;
      }
      targets.forEach((el) => {
        for (const pair of decl.split(";")) {
          const idx = pair.indexOf(":");
          if (idx <= 0) continue;
          const prop = pair.slice(0, idx).trim();
          let value = pair.slice(idx + 1).trim();
          if (!prop || prop.startsWith("mso-")) continue;
          if (el instanceof HTMLElement && !el.style.getPropertyValue(prop)) {
            if (prop.startsWith("border")) {
              value = applyPx(value).replace(/windowtext/gi, "#000000");
            }
            el.style.setProperty(prop, value);
          }
        }
      });
    }
    tag.remove();
  }
}

// Elimina nodos con namespace de Office (VML, OOXML): w:, o:, m:, v:, s:, dt:.
function removeOfficeNamespaceNodes(doc: Document) {
  const badTagRe = /^(?:w|o|m|v|s|dt|u|l):/i;
  doc.body
    .querySelectorAll("*")
    .forEach((el) => {
      if (badTagRe.test(el.tagName)) el.remove();
    });
}

function removeConditionalComments(doc: Document) {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const toRemove: Comment[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    toRemove.push(node as Comment);
  }
  toRemove.forEach((c) => c.remove());
}

function cleanupAttributes(doc: Document) {
  doc.body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (
        name.startsWith("xmlns") ||
        /^(?:w|o|m|v|s|dt|u|l):/.test(name) ||
        name.startsWith("mso-") ||
        name.startsWith("o:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
    // Conserva las imágenes pegadas desde el portapapeles.
    if (el instanceof HTMLImageElement && !el.getAttribute("src")) {
      el.remove();
    }
  });
}

function normalizeTables(doc: Document) {
  doc.querySelectorAll("table").forEach((table) => {
    if (table instanceof HTMLElement) {
      table.style.setProperty("border-collapse", "collapse");
      const width = table.getAttribute("width");
      if (width && !table.style.width) {
        table.style.setProperty("width", /^\d+$/.test(width) ? `${width}px` : width);
      }
      if (!table.getAttribute("width") && !table.style.width) {
        table.style.setProperty("width", "100%");
      }
    }
  });

  doc.querySelectorAll("td, th").forEach((cell) => {
    if (!(cell instanceof HTMLElement)) return;
    const bg = cell.getAttribute("bgcolor");
    if (bg) {
      cell.style.setProperty("background-color", normalizeColor(bg));
      cell.removeAttribute("bgcolor");
    }
    const width = cell.getAttribute("width");
    if (width && !cell.style.width) {
      cell.style.setProperty("width", /^\d+$/.test(width) ? `${width}px` : width);
    }
    if (cell.style.borderWidth === "") {
      cell.style.setProperty("border", "1px solid #cbd5e1");
    }
    if (cell.getAttribute("align") && !cell.style.textAlign) {
      cell.style.setProperty(
        "text-align",
        cell.getAttribute("align") || "left"
      );
    }
    if (cell.getAttribute("valign") && !cell.style.verticalAlign) {
      cell.style.setProperty(
        "vertical-align",
        cell.getAttribute("valign") || "middle"
      );
    }
  });
}

function normalizeInlineStyles(doc: Document) {
  doc.body.querySelectorAll("*[style]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const style = el.style;
    // Convierte unidades pt a px fuera de font-size (TipTap la maneja en pt).
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      if (prop.startsWith("mso-") || prop.startsWith("-webkit-")) {
        style.removeProperty(prop);
        i--;
        continue;
      }
      const value = style.getPropertyValue(prop);
      if (prop === "color" || prop === "background-color" || prop.startsWith("background")) {
        style.setProperty(prop, normalizeColor(value));
      } else if (prop !== "font-size" && value.includes("pt")) {
        style.setProperty(prop, applyPx(value));
      }
    }
    // Elimina <o:p> vacíos y espacios residuales de Word.
    if (el.tagName === "O:P") el.remove();
    if (
      el.textContent &&
      el.textContent.trim() === "" &&
      el.tagName !== "IMG" &&
      el.tagName !== "BR" &&
      (el.tagName === "SPAN" || el.tagName === "P")
    ) {
      if (!style.fontSize && !style.color && !style.backgroundColor && !style.textAlign) {
        el.remove();
      }
    }
  });
}

export function sanitizeOfficePaste(html: string): string {
  if (!html || !html.trim()) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");

  removeConditionalComments(doc);
  inlineStylesFromStyleTags(doc);
  removeOfficeNamespaceNodes(doc);
  normalizeTables(doc);
  normalizeInlineStyles(doc);
  cleanupAttributes(doc);

  return doc.body.innerHTML;
}
