import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AnalyticsService } from "@shared/services/analytics.service";
import { useAuthContext } from "@features/auth/hooks/useAuthContext";

const SESSION_KEY = "analytics_session_id";
const SESSION_START_KEY = "analytics_session_start";
const LAST_PAGE_KEY = "analytics_last_page";
const LAST_PAGE_TIME_KEY = "analytics_last_page_time";

// Variables globales a nivel de módulo para dedup global entre múltiples componentes que usan useAnalytics()
let globalLastTrackedPath: string | null = null;
let globalLastTrackedTime = 0;

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

function getBrowser(): string {
  const ua = navigator.userAgent;
  // Detect Brave (expone navigator.brave.isBrave)
  if ((navigator as any).brave && typeof (navigator as any).brave.isBrave === "function") return "Brave";
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  return "Unknown";
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return sessionId;
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
        page_path: location.pathname + location.search,
        user_id: user?.id || null,
        device_type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        referrer: document.referrer || undefined,
        event_metadata: eventMetadata,
      };

      try {
        await AnalyticsService.track(payload);
      } catch (e) {
        // Silenciar errores de tracking
      }
    },
    [location.pathname, location.search, user]
  );

  // Track page view on route change
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath);
  }, [location.pathname, location.search, trackPageView]);

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
