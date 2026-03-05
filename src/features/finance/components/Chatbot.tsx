import React, { useState, useRef, useEffect, useCallback } from 'react';


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  isHtml?: boolean;
}

interface FormData {
  [key: string]: string;
}

interface CompanyData {
  ticker: string;
  company_name: string;
  country: string;
  sector: string;
  dc_ratio: number | null;
  effective_tax_rate: number | null;
  beta_levered: number | null;
  beta_unlevered: number | null;
}

interface YahooFinanceData {
  success: boolean;
  valid_companies: CompanyData[];
  group_statistics?: {
    avg_beta_unlevered?: number;
    avg_dc_ratio?: number;
    avg_tax_rate?: number;
    median_beta_unlevered?: number;
    median_dc_ratio?: number;
    median_tax_rate?: number;
  };
}

interface FinancialData {
  dc_ratio?: number;
  effective_tax_rate?: number;
  beta_levered?: number | null;
  beta_unlevered?: number;
}

interface ChatbotProps {
  geminiApiKey?: string;
}

const now = (): string =>
  new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const uid = (): string => Math.random().toString(36).slice(2, 9);

const formatAPIResponse = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/^\s*\d+\.\s+\*\*(.*?)\*\*:\s*/gm, '$1: ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^\s*\*\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .replace(/:\s*\n\n/g, ':\n');
};

const WELCOME_TEXT =
  '¡Hola! Soy Betito, tu asistente especializado en análisis de BETA para WACC.\n\nPuedo ayudarte a:\n• Analizar tu beta actual basado en los datos del formulario\n• Recomendar 10-20 empresas comparables del sector\n• Calcular un nuevo beta optimizado\n• Actualizar automáticamente tu formulario\n\n¿Quieres que analice tus datos actuales?';


const StatusDot: React.FC = () => (
  <span className="inline-block w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)] animate-pulse" />
);

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-2 mt-2 px-1">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-sky-400"
          style={{ animation: `typingBounce 1.4s ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
    <span className="text-xs text-slate-400">Analizando datos financieros...</span>
  </div>
);

interface CompanyCardProps {
  company: CompanyData;
  onApply: (company: CompanyData) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onApply }) => {
  const dcPct = company.dc_ratio != null ? (company.dc_ratio * 100).toFixed(1) : 'N/A';
  const taxPct = company.effective_tax_rate != null ? (company.effective_tax_rate * 100).toFixed(1) : 'N/A';
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer transition-all duration-200 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      onClick={() => onApply(company)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-700 leading-tight">{company.company_name}</span>
        <span className="text-[10px] font-bold bg-sky-500 text-white px-1.5 py-0.5 rounded">{company.ticker}</span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">{company.country} | {company.sector}</p>
      <div className="border-t border-slate-100 pt-2 space-y-1">
        {[
          ['D/C Ratio', `${dcPct}%`],
          ['Tasa Impositiva', `${taxPct}%`],
          ['Beta Apalancado', company.beta_levered ?? 'N/A'],
        ].map(([label, val]) => (
          <div key={label as string} className="flex justify-between text-[10px]">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-sky-500 font-semibold">{val as string}</span>
          </div>
        ))}
        <div className="flex justify-between text-[10px] bg-gradient-to-r from-sky-50 to-slate-50 rounded px-1.5 py-1 mt-1">
          <span className="text-slate-600 font-semibold">Beta Desapalancado</span>
          <span className="text-sky-600 font-bold">{company.beta_unlevered ?? 'N/A'}</span>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 border-t border-slate-100 pt-1.5 text-[10px] text-sky-400 font-medium gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
        Haz clic para usar estos datos
      </div>
    </div>
  );
};

interface YahooResultsProps {
  data: YahooFinanceData;
  onApply: (company: CompanyData) => void;
}

const YahooResults: React.FC<YahooResultsProps> = ({ data, onApply }) => (
  <div className="rounded-xl border-l-4 border-sky-400 bg-slate-50 p-3 mt-1 space-y-3">
    <h5 className="text-sm font-bold text-sky-500 flex items-center gap-1.5">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
      Análisis Yahoo Finance Completado
    </h5>
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        Empresas Analizadas
      </p>
      <div className="grid grid-cols-1 gap-2">
        {data.valid_companies.map((company) => (
          <CompanyCard key={company.ticker} company={company} onApply={onApply} />
        ))}
      </div>
    </div>
  </div>
);

interface BetaUpdateCardProps {
  response: string;
  newBeta: number;
  onUpdate: (beta: number) => void;
}

const BetaUpdateCard: React.FC<BetaUpdateCardProps> = ({ response, newBeta, onUpdate }) => (
  <div className="space-y-3">
    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{response}</p>
    <div className="rounded-xl border-l-4 border-sky-400 bg-gradient-to-r from-sky-50 to-slate-50 p-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-lg font-bold text-sky-500">Nuevo Beta Sugerido: {newBeta}</p>
        <p className="text-[10px] text-slate-400">Basado en empresas comparables del sector</p>
      </div>
      <button
        onClick={() => onUpdate(newBeta)}
        className="shrink-0 text-xs font-semibold text-white bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      >
        Actualizar Beta
      </button>
    </div>
  </div>
);


interface MessageBubbleProps {
  msg: Message;
  onApplyCompany?: (company: CompanyData) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''} mb-4`} style={{ animation: 'fadeUp 0.3s ease' }}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-sm ${isUser ? 'bg-slate-500' : 'bg-sky-500'}`}>
        {isUser
          ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        }
      </div>
      <div className={`flex flex-col max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-br-sm'
            : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
        }`}>
          {msg.text}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 px-2">{msg.time}</span>
      </div>
    </div>
  );
};


interface RichMessageProps {
  children: React.ReactNode;
  time: string;
}

const RichMessage: React.FC<RichMessageProps> = ({ children, time }) => (
  <div className="flex gap-2 mb-4" style={{ animation: 'fadeUp 0.3s ease' }}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-sm bg-sky-500">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
    </div>
    <div className="flex flex-col max-w-[88%] items-start">
      <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white text-slate-700 shadow-sm border border-slate-100 w-full">
        {children}
      </div>
      <span className="text-[11px] text-slate-400 mt-1 px-2">{time}</span>
    </div>
  </div>
);


interface ConvItem {
  id: string;
  type: 'simple' | 'yahoo' | 'beta';
  msg?: Message;
  yahooData?: YahooFinanceData;
  betaData?: { response: string; newBeta: number };
  time: string;
}


export const Chatbot: React.FC<ChatbotProps> = ({ geminiApiKey = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConvItem[]>([
    {
      id: uid(),
      type: 'simple',
      msg: { id: uid(), text: WELCOME_TEXT, sender: 'ai', time: now() },
      time: now(),
    },
  ]);
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const pushItem = useCallback((item: ConvItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const addSimple = useCallback((text: string, sender: 'user' | 'ai') => {
    pushItem({ id: uid(), type: 'simple', msg: { id: uid(), text, sender, time: now() }, time: now() });
  }, [pushItem]);

  const getCurrentFormData = (): FormData | null => {
    const form = document.querySelector('.formWACC') as HTMLFormElement | null;
    if (!form) return null;
    const data: FormData = {};
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((el) => {
      if (el.name && el.value) data[el.name] = el.value;
    });
    return data;
  };

  const applyCompanyData = useCallback((company: CompanyData) => {
    updateFinancialData({
      dc_ratio: company.dc_ratio ?? undefined,
      effective_tax_rate: company.effective_tax_rate ?? undefined,
      beta_levered: company.beta_levered,
      beta_unlevered: company.beta_unlevered ?? undefined,
    });
    addSimple(`📊 Datos de ${company.company_name} (${company.ticker}) aplicados al formulario exitosamente.`, 'ai');
  }, [addSimple]); // eslint-disable-line

  const updateFinancialData = (financialData: FinancialData) => {
    const toggle = document.getElementById('financialDataToggle') as HTMLInputElement | null;
    const collapse = document.getElementById('collapseFinancialData');
    const icon = document.getElementById('collapseFaToggleFinancial');
    if (toggle && !toggle.checked) {
      toggle.checked = true;
      collapse?.classList.add('show');
      icon?.classList.replace('fa-toggle-off', 'fa-toggle-on');
    }
    const fire = (id: string, value: string) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) { el.value = value; el.dispatchEvent(new Event('change', { bubbles: true })); }
    };
    if (financialData.dc_ratio != null) fire('dcRatioFormInput', financialData.dc_ratio.toFixed(4));
    if (financialData.effective_tax_rate != null) fire('effectiveTaxRateFormInput', (financialData.effective_tax_rate * 100).toFixed(2));
    if (financialData.beta_levered != null) fire('betaLeveredFormInput', financialData.beta_levered.toFixed(4));
    if (financialData.beta_unlevered != null) fire('betaUnleveredFormInput', financialData.beta_unlevered.toFixed(4));
    setTimeout(() => collapse?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
  };

  const updateBetaValue = useCallback((newBeta: number) => {
    const selectors = ['input[name="beta"]', '#betaInput', 'input[name*="beta" i]', 'input[name="beta_unlevered"]', 'input[name="beta_levered"]'];
    let found = false;
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLInputElement | null;
      if (el) { el.value = String(newBeta); el.dispatchEvent(new Event('change', { bubbles: true })); found = true; break; }
    }
    if (found) {
      addSimple(`✓ Beta actualizado a ${newBeta} exitosamente.`, 'ai');
    } else {
      addSimple(`Para análisis sectorial, el beta ${newBeta} se aplicará como referencia.`, 'ai');
    }
  }, [addSimple]);

  const analyzeYahooTickers = useCallback(async (tickers: string[]) => {
    addSimple('🔍 Analizando empresas en Yahoo Finance...', 'ai');
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: YahooFinanceData = await res.json();
      if (data.success && data.valid_companies?.length) {
        pushItem({ id: uid(), type: 'yahoo', yahooData: data, time: now() });
      } else {
        addSimple('⚠️ No se pudieron obtener datos válidos de Yahoo Finance.', 'ai');
      }
    } catch (e: unknown) {
      addSimple(`❌ Error analizando empresas: ${(e as Error).message}`, 'ai');
    } finally {
      setLoading(false);
    }
  }, [addSimple, pushItem]);

  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  const callGeminiAPI = useCallback(async (userMessage: string) => {
    setLoading(true);
    try {
      const key = geminiApiKey;
      if (!key || !key.startsWith('AIza')) {
        addSimple('API key no configurada o inválida. Contacta al administrador.', 'ai');
        setLoading(false);
        return;
      }
      const formData = getCurrentFormData();

      const systemPrompt = `Eres un asistente especializado en análisis de BETA FINANCIERO para cálculos WACC en la plataforma Kapitals.

DATOS ACTUALES DEL USUARIO:
${formData ? `FORMULARIO WACC:\n${Object.entries(formData).map(([k, v]) => `- ${k}: ${v}`).join('\n')}` : 'No hay datos del formulario'}

FORMATO DE RESPUESTA OBLIGATORIO:
=== ANÁLISIS DE BETA PARA [SECTOR] ===
Análisis automatizado solicitado.
TICKERS:[TICKER1,TICKER2,...,TICKER20]
[Explicación breve]

INSTRUCCIONES CRÍTICAS:
- SIEMPRE incluye "TICKERS:[lista]" en tu respuesta
- Tickers separados por comas SIN ESPACIOS
- Solo tickers reales de Yahoo Finance
- Para empresas internacionales usa sufijos (.TO, .L, .PA)`;

      const contents = [
        ...(history.length === 0
          ? [
              { role: 'user', parts: [{ text: systemPrompt }] },
              { role: 'model', parts: [{ text: 'Perfecto. Soy tu asistente especializado en análisis de beta para WACC. ¿Quieres que analice tus datos actuales?' }] },
            ]
          : []),
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
      ];

      const res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.2, maxOutputTokens: 8192, topP: 0.8, topK: 40 } }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const rawResponse: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      const tickersMatch = rawResponse.match(/TICKERS:\[([^\]]+)\]/i);
      if (tickersMatch) {
        const tickers = tickersMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
        const displayText = formatAPIResponse(rawResponse.replace(/TICKERS:\[([^\]]+)\]/i, '').trim());
        addSimple(displayText, 'ai');
        if (tickers.length) analyzeYahooTickers(tickers);
      } else {
        const betaMatch = rawResponse.match(/BETA_UPDATE:\s*([\d.]+)/i);
        if (betaMatch) {
          const cleanText = formatAPIResponse(rawResponse.replace(/BETA_UPDATE:\s*[\d.]+/i, '').trim());
          pushItem({ id: uid(), type: 'beta', betaData: { response: cleanText, newBeta: parseFloat(betaMatch[1]) }, time: now() });
        } else {
          addSimple(formatAPIResponse(rawResponse), 'ai');
        }
      }

      setHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: rawResponse }] },
      ]);
    } catch (e: unknown) {
      const fallbacks = [
        'Disculpa, tengo problemas técnicos. Betas de referencia: Tecnología (1.2-1.5), Financiero (1.1-1.3), Retail (0.9-1.2), Utilities (0.6-0.8).',
        'No puedo acceder a la base de datos ahora. Para tu sector considera betas entre 0.8-1.5. ¿Necesitas ayuda con algún cálculo?',
      ];
      addSimple(fallbacks[Math.floor(Math.random() * fallbacks.length)], 'ai');
    } finally {
      setLoading(false);
    }
  }, [geminiApiKey, history, addSimple, pushItem, analyzeYahooTickers]);

  const sendMessage = useCallback(() => {
    const msg = input.trim();
    if (!msg || loading) return;
    addSimple(msg, 'user');
    setInput('');
    callGeminiAPI(msg);
  }, [input, loading, addSimple, callGeminiAPI]);

  const clearHistory = () => {
    setHistory([]);
    setItems([{ id: uid(), type: 'simple', msg: { id: uid(), text: WELCOME_TEXT, sender: 'ai', time: now() }, time: now() }]);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
      `}</style>

      <div className="fixed bottom-5 right-5 z-[1050] flex flex-col items-end">
        {isOpen && (
          <div
            className="mb-4 w-[460px] max-w-[calc(100vw-40px)] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white"
            style={{ animation: 'slideUp 0.3s ease', height: '680px', display: 'flex', flexDirection: 'column' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5 text-white" style={{ background: 'linear-gradient(135deg,#009ef7 0%,#007dc4 100%)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span className="font-bold text-sm tracking-wide">Betito - Asistente WACC</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot />
                <button onClick={clearHistory} title="Nueva conversación" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
              {items.map((item) => {
                if (item.type === 'simple' && item.msg) {
                  return <MessageBubble key={item.id} msg={item.msg} />;
                }
                if (item.type === 'yahoo' && item.yahooData) {
                  return (
                    <RichMessage key={item.id} time={item.time}>
                      <YahooResults data={item.yahooData} onApply={applyCompanyData} />
                    </RichMessage>
                  );
                }
                if (item.type === 'beta' && item.betaData) {
                  return (
                    <RichMessage key={item.id} time={item.time}>
                      <BetaUpdateCard {...item.betaData} onUpdate={updateBetaValue} />
                    </RichMessage>
                  );
                }
                return null;
              })}
              {loading && (
                <div className="flex gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-500 shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  disabled={loading}
                  placeholder="Ej: Analiza mi beta actual..."
                  className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#009ef7 0%,#007dc4 100%)' }}
                >
                  {loading
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#009ef7 0%,#007dc4 100%)' }}
          title="Abrir Betito"
        >
          {isOpen
            ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          }
        </button>
      </div>
    </>
  );
};

export default Chatbot;