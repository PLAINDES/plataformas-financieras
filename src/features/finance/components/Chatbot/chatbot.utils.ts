export const now = (): string =>
  new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const uid = (): string => Math.random().toString(36).slice(2, 9);

export const WELCOME_TEXT =
  "¡Hola! Soy **Betito**, tu asistente especializado en análisis de BETA para WACC.\n\nPuedo ayudarte a:\n- Analizar tu beta actual basado en los datos del formulario\n- Recomendar 10-20 empresas comparables del sector\n- Calcular un nuevo beta optimizado\n- Actualizar automáticamente tu formulario\n\n¿Quieres que analice tus datos actuales?";

// Constantes para el límite de mensajes
export const RATE_LIMIT_KEY = "betito_rate_limit";
export const LIMIT_TIME_MS = 3 * 60 * 1000;
export const MAX_MESSAGES = 5;

// Verifica el límite de mensajes en localStorage
export const checkRateLimit = (): boolean => {
  if (typeof window === "undefined") return true;

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    if (stored) {
      const { count, timestamp } = JSON.parse(stored);
      // Verifica si seguimos en la ventana de 3 minutos
      if (now - timestamp < LIMIT_TIME_MS) {
        if (count >= MAX_MESSAGES) {
          return false; // Límite alcanzado
        } else {
          localStorage.setItem(
            RATE_LIMIT_KEY,
            JSON.stringify({ count: count + 1, timestamp })
          );
          return true;
        }
      }
    }
    // Reinicia el contador si el tiempo expiró o no existe
    localStorage.setItem(
      RATE_LIMIT_KEY,
      JSON.stringify({ count: 1, timestamp: now })
    );
    return true;
  } catch (e) {
    return true;
  }
};
