import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy, ExternalLink, Link2, X, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { PATHS } from "./BrowserBrand";
import { PLATFORM_COLORS } from "./PlatformColors";

type Platform = {
  id: string;
  label: string;
  source: string;
  color: string;
  icon: ReactNode;
};

const brandIcon = (path: string) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

const whatsappIcon = (
  <svg viewBox="0 0 256 259" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
    <path d="m67.663 221.823 4.185 2.093c17.44 10.463 36.971 15.346 56.503 15.346 61.385 0 111.609-50.224 111.609-111.609 0-29.297-11.859-57.897-32.785-78.824-20.927-20.927-48.83-32.785-78.824-32.785-61.385 0-111.61 50.224-110.912 112.307 0 20.926 6.278 41.156 16.741 58.594l2.79 4.186-11.16 41.156 41.853-10.464Z" />
    <path d="M219.033 37.668C195.316 13.254 162.531 0 129.048 0 57.898 0 .698 57.897 1.395 128.35c0 22.322 6.278 43.947 16.742 63.478L0 258.096l67.663-17.439c18.834 10.464 39.76 15.347 60.688 15.347 70.453 0 127.653-57.898 127.653-128.35 0-34.181-13.254-66.269-36.97-89.986Z" />
  </svg>
);

const PLATFORMS: Platform[] = [
  { id: "linkedin", label: "LinkedIn", source: "linkedin", color: PLATFORM_COLORS.linkedin, icon: <Linkedin className="h-[18px] w-[18px]" /> },
  { id: "whatsapp", label: "WhatsApp", source: "whatsapp", color: PLATFORM_COLORS.whatsapp, icon: whatsappIcon },
  { id: "facebook", label: "Facebook", source: "facebook", color: PLATFORM_COLORS.facebook, icon: <Facebook className="h-[18px] w-[18px]" /> },
  { id: "youtube", label: "YouTube", source: "youtube", color: PLATFORM_COLORS.youtube, icon: <Youtube className="h-[18px] w-[18px]" /> },
  { id: "instagram", label: "Instagram", source: "instagram", color: PLATFORM_COLORS.instagram, icon: <Instagram className="h-[18px] w-[18px]" /> },
  { id: "tiktok", label: "TikTok", source: "tiktok", color: PLATFORM_COLORS.tiktok, icon: brandIcon(PATHS.tiktok) },
  { id: "x", label: "X", source: "x", color: PLATFORM_COLORS.x, icon: <span className="text-[13px] font-bold leading-none text-white">X</span> },
  { id: "telegram", label: "Telegram", source: "telegram", color: PLATFORM_COLORS.telegram, icon: brandIcon(PATHS.telegram) },
];

const DESTINATIONS = [
  { id: "kapital", label: "Kapital", path: "/kapital" },
  { id: "valora", label: "Valora", path: "/valora" },
  { id: "landing", label: "Landing", path: "/" },
];

const UtmLinkGenerator = () => {
  const [open, setOpen] = useState(false);
  const [platformId, setPlatformId] = useState("linkedin");
  const [destinationId, setDestinationId] = useState("kapital");
  const [copied, setCopied] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<number | null>(null);

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0];
  const destination = DESTINATIONS.find((d) => d.id === destinationId) ?? DESTINATIONS[0];

  const params = new URLSearchParams();
  params.set("utm_source", platform.source);
  const url = `${window.location.origin}${destination.path}?${params.toString()}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || fabRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-[120] w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="dialog"
          aria-label="Compartir enlace"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Compartir enlace</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Elige la plataforma y copia el enlace listo para tu publicación.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PLATFORMS.map((item) => {
              const selected = item.id === platformId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPlatformId(item.id)}
                  aria-pressed={selected}
                  title={item.label}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                    selected ? "" : "border-gray-100 hover:bg-gray-50"
                  }`}
                  style={
                    selected
                      ? { borderColor: item.color, backgroundColor: `${item.color}14`, boxShadow: `0 0 0 1px ${item.color}` }
                      : undefined
                  }
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </span>
                  <span className="max-w-full truncate text-[10px] font-medium text-gray-600">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Destino</p>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
              {DESTINATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDestinationId(item.id)}
                  className={`cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    item.id === destinationId ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-100 bg-slate-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Vista previa</p>
            <p className="break-all font-mono text-[11px] leading-relaxed text-gray-600">{url}</p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors ${
                copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar link"}
            </button>
            <button
              type="button"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              aria-label="Probar link en pestaña nueva"
              title="Probar link"
              className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Cerrar panel de compartir enlace" : "Compartir enlace"}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-[120] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
      >
        {open ? <X className="h-6 w-6" /> : <Link2 className="h-6 w-6" />}
      </button>
    </>
  );
};

export default UtmLinkGenerator;
