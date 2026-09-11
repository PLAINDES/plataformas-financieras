const WEB_SERVICE_URL =
  import.meta.env.VITE_WEB_SERVICE_URL || "http://localhost:8080";

export interface NativeValoraResponse {
  success: boolean;
  calculation_id?: string | null;
  wacc?: number | string | null;
  wacc_emergente?: number | string | null;
  price_per_share?: number | string | null;
  enterprise_value?: number | string | null;
  equity_value?: number | string | null;
  balance?: Record<string, unknown> | null;
  conceptos?: Record<string, unknown> | null;
  integrado?: Record<string, unknown> | null;
  conceptos_emergente?: Record<string, unknown> | null;
  integrado_emergente?: Record<string, unknown> | null;
  sensitivity_results?: Array<Record<string, unknown>> | null;
  execution_time_ms: number;
  excel_session_id?: string | null;
  warnings?: string[];
  xlsx_base64?: string | null;
  filename?: string | null;
  s3_key?: string | null;
  s3_url?: string | null;
}

const NATIVE_TIMEOUT_MS = 900000; // 15 min: Excel COM + CalculateFull tarda minutos

export async function calculateValoraNative(
  input: Record<string, unknown>,
  sensitivity?: Record<string, unknown> | null
): Promise<NativeValoraResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, NATIVE_TIMEOUT_MS);

  try {
    const response = await fetch(`${WEB_SERVICE_URL}/api/v1/valora/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, sensitivity: sensitivity ?? null }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        detail =
          (data as { detail?: string }).detail || JSON.stringify(data) || detail;
      } catch {
        // mantener detail por status
      }
      throw new Error(`Excel nativo: ${detail}`);
    }

    return (await response.json()) as NativeValoraResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        timedOut
          ? "Excel nativo: se superaron 15 min de espera, el servidor sigue calculando. Revisa el tab debug S3."
          : "Excel nativo: la petición fue cancelada."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function calculateKapitalNative(
  input: Record<string, unknown>,
  sensitivity?: Record<string, unknown> | null
): Promise<Record<string, unknown>> {
  const response = await fetch(`${WEB_SERVICE_URL}/api/v1/kapital/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, sensitivity: sensitivity ?? null }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(`Excel nativo Kapital: ${(data as { detail?: string }).detail || `HTTP ${response.status}`}`);
  }
  return (await response.json()) as Record<string, unknown>;
}
