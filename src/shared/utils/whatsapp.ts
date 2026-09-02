const DEFAULT_WHATSAPP_MESSAGE =
  "✅🧑🏻‍💻👩🏻‍💻Quisiera ser parte de la comunidad Financiera: ProFinance";

export function buildWhatsAppUrl(rawInput: string, customMessage?: string): string {
  if (!rawInput) return "";
  let phone = rawInput.trim();
  try {
    if (phone.startsWith("http")) {
      const url = new URL(phone);
      const p = url.searchParams.get("phone");
      if (p) phone = p;
    }
  } catch {}
  // valida prefijo +51 antes de construir
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (!phone.trim().startsWith("+")) return "";
  if (!digits.startsWith("51")) return "";
  const cleanNumber = digits;
  const message = customMessage ?? DEFAULT_WHATSAPP_MESSAGE;
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
}

export function extractWhatsAppNumber(rawUrlOrNumber: string): string {
  if (!rawUrlOrNumber) return "";
  try {
    if (rawUrlOrNumber.trim().startsWith("http")) {
      const url = new URL(rawUrlOrNumber.trim());
      const p = url.searchParams.get("phone");
      if (p) return p.replace(/[^0-9]/g, "");
    }
  } catch {}
  return rawUrlOrNumber.replace(/[^0-9]/g, "");
}
