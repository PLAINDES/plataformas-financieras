import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AnalyticsService } from "@shared/services/analytics.service";
import { useAuthContext } from "@features/auth/hooks/useAuthContext";

const SESSION_KEY = "analytics_session_id";
const SESSION_START_KEY = "analytics_session_start";
const LAST_PAGE_KEY = "analytics_last_page";
const LAST_PAGE_TIME_KEY = "analytics_last_page_time";
const DEVICE_ID_KEY = "analytics_device_id";
const UTM_SESSION_KEY = "analytics_entry_utm";
const UTM_KEYS = ["utm_source"] as const;

// Variables globales a nivel de módulo para dedup global entre múltiples componentes que usan useAnalytics()
let globalLastTrackedPath: string | null = null;
let globalLastTrackedTime = 0;

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua)) return "tablet";
    return "mobile";
  }
  return "desktop";
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  if (/Android/i.test(ua)) return "Android";
  if (/iOS|iPhone|iPad/i.test(ua)) return "iOS";
  return "Unknown";
}

function getChromiumBrand(): string | null {
  // Client Hints: algunos forks Chromium no dejan huella en el UA pero
  // sí se identifican en userAgentData.brands.
  try {
    const brands = (navigator as any).userAgentData?.brands as
      | { brand: string }[]
      | undefined;
    if (!Array.isArray(brands)) return null;
    const names = brands.map((b) => String(b?.brand || "").toLowerCase());
    if (names.some((n) => n.includes("opera"))) return "Opera";
    if (names.some((n) => n.includes("edge"))) return "Edge";
    if (names.some((n) => n.includes("vivaldi"))) return "Vivaldi";
    if (names.some((n) => n.includes("arc"))) return "Arc";
    if (names.some((n) => n.includes("yandex"))) return "Yandex";
    if (names.some((n) => n.includes("samsung"))) return "Samsung Internet";
    if (names.some((n) => n.includes("whale"))) return "Whale";
    if (names.some((n) => n.includes("brave"))) return "Brave";
  } catch {
    return null;
  }
  return null;
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  // Detect Brave (expone navigator.brave.isBrave)
  if ((navigator as any).brave && typeof (navigator as any).brave.isBrave === "function") return "Brave";
  // Navegadores dentro de apps: usan el motor del sistema pero con su propio UA.
  // Deben ir antes de Chrome/Safari porque contienen esos tokens.
  if (/MicroMessenger/i.test(ua)) return "WeChat";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS|FBDV/i.test(ua)) return "Facebook";
  if (/Telegram/i.test(ua)) return "Telegram";
  if (/\bLine\//i.test(ua)) return "LINE";
  if (/musical_ly|musically|Bytedance/i.test(ua) || /TikTok/i.test(ua)) return "TikTok";
  if (/UCBrowser|UC /i.test(ua)) return "UC Browser";
  if (/QQBrowser|QQ\//i.test(ua)) return "QQ Browser";
  if (/baiduboxapp|Baidu/i.test(ua)) return "Baidu";
  if (/HuaweiBrowser/i.test(ua)) return "Huawei Browser";
  if (/MiuiBrowser/i.test(ua)) return "Mi Browser";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Whale/i.test(ua)) return "Whale";
  if (/YaBrowser/i.test(ua)) return "Yandex";
  if (/coc_coc_browser/i.test(ua)) return "Coc Coc";
  if (/Vivaldi/i.test(ua)) return "Vivaldi";
  if (/Arc\/[\d.]+/i.test(ua)) return "Arc";
  if (/OPR\/|Opera|OPiOS|Opera Mini|OPTMini/i.test(ua)) return "Opera";
  if (/Edg\/|EdgA|EdgiOS/i.test(ua)) return "Edge";
  if (/DuckDuckGo/i.test(ua)) return "DuckDuckGo";
  if (/; wv\)|\bwv\b/i.test(ua)) return "Android WebView";
  if (/CriOS|Chrome|Chromium/i.test(ua)) return getChromiumBrand() ?? "Chrome";
  if (/FxiOS|Firefox|Focus\//i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  if (/MSIE|Trident/i.test(ua)) return "Internet Explorer";
  return "Otro";
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    captureEntryUtm();
  }
  return sessionId;
}

// Atribución first-touch por sesión: el UTM se captura una sola vez al
// crear la sesión (página de entrada) y nunca se sobrescribe por
// navegación interna. Así cada sesión cuenta para el origen que la trajo.
function captureEntryUtm(): void {
  try {
    if (sessionStorage.getItem(UTM_SESSION_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = (params.get(key) || "").trim().toLowerCase();
      if (value) utm[key] = value;
    }
    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utm));
  } catch {
    // Sin almacenamiento: se reintenta en el próximo track.
  }
}

function getStoredUtm(): { utm_source?: string } {
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      if (typeof parsed[key] === "string" && parsed[key]) out[key] = parsed[key] as string;
    }
    return out;
  } catch {
    return {};
  }
}

export function useAnalytics() {
  const location = useLocation();
  const { user } = useAuthContext();

  const trackPageView = useCallback(
    async (pagePath: string) => {
      const sessionId = getOrCreateSessionId();
      const now = Date.now();

      // DEDUP GLOBAL: evitar trackear el mismo path en menos de 3 segundos.
      // Previene duplicados cuando múltiples componentes hijos invocan useAnalytics()
      if (
        globalLastTrackedPath === pagePath &&
        now - globalLastTrackedTime < 3000
      ) {
        return;
      }
      globalLastTrackedPath = pagePath;
      globalLastTrackedTime = now;

      // Calcular tiempo en la página anterior
      const lastPage = sessionStorage.getItem(LAST_PAGE_KEY);
      const lastPageTime = sessionStorage.getItem(LAST_PAGE_TIME_KEY);
      if (lastPage && lastPageTime) {
        const timeOnPage = Math.floor((now - parseInt(lastPageTime, 10)) / 1000);
        if (timeOnPage > 0) {
          AnalyticsService.updatePageViewDuration(sessionId, lastPage, timeOnPage).catch(() => {});
        }
      }

      // Guardar nueva página y tiempo
      sessionStorage.setItem(LAST_PAGE_KEY, pagePath);
      sessionStorage.setItem(LAST_PAGE_TIME_KEY, now.toString());

      const payload = {
        session_id: sessionId,
        event_name: "page_view",
        page_path: pagePath,
        user_id: user?.id || null,
        device_type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        referrer: document.referrer || undefined,
        ...getStoredUtm(),
      };

      try {
        await AnalyticsService.track(payload);
      } catch (e) {
        // Silenciar errores de tracking
      }
    },
    [user]
  );

  const trackEvent = useCallback(
    async (eventName: string, eventMetadata?: Record<string, any>) => {
      const sessionId = getOrCreateSessionId();
      const payload = {
        session_id: sessionId,
        event_name: eventName,
        page_path: location.pathname || "/",
        user_id: user?.id || null,
        device_type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        referrer: document.referrer || undefined,
        ...getStoredUtm(),
        event_metadata: {
          ...eventMetadata,
          device_id: getOrCreateDeviceId(),
        },
      };

      try {
        await AnalyticsService.track(payload);
      } catch (e) {
        // Silenciar errores de tracking
      }
    },
    [location.pathname, user]
  );

  // Track page view on route change
  useEffect(() => {
    const pagePath = location.pathname || "/";
    trackPageView(pagePath);
  }, [location.pathname, trackPageView]);

  // End session on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = sessionStorage.getItem(SESSION_KEY);
      const startTime = sessionStorage.getItem(SESSION_START_KEY);
      if (sessionId && startTime) {
        const duration = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
        // Usar sendBeacon para garantizar envío antes de cerrar
        const url = `${import.meta.env.DEV ? window.location.origin : import.meta.env.VITE_API_URL}/api/v1/analytics/session/end`;
        const blob = new Blob(
          [JSON.stringify({ session_id: sessionId, duration_seconds: duration })],
          { type: "application/json" }
        );
        navigator.sendBeacon?.(url, blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { trackEvent };
}
