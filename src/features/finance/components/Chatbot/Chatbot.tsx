import { useState, useRef, useEffect, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  type CompanyData,
  type YahooFinanceData,
  type Message,
  type FinancialData,
  type ChatbotProps,
} from "./chatbot.interfaces";
import { Sparkles, ArrowUp, RotateCcw, X } from "lucide-react";
import { YahooResults, BetaUpdateCard } from "./ChatbotUI";

const now = (): string =>
  new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

const uid = (): string => Math.random().toString(36).slice(2, 9);

const WELCOME_TEXT =
  "¡Hola! Soy Betito, tu asistente especializado en análisis de BETA para WACC.\n\nPuedo ayudarte a:\n• Analizar tu beta actual basado en los datos del formulario\n• Recomendar 10-20 empresas comparables del sector\n• Calcular un nuevo beta optimizado\n• Actualizar automáticamente tu formulario\n\n¿Quieres que analice tus datos actuales?";

interface ConvItem {
  id: string;
  type: "simple" | "yahoo" | "beta";
  msg?: Message;
  yahooData?: YahooFinanceData;
  betaData?: { response: string; newBeta: number };
  time: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  formData: externalFormData,
  isWaccCalculated,
  isOpen,
  setIsOpen,
}) => {
  //const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConvItem[]>([
    {
      id: uid(),
      type: "simple",
      msg: { id: uid(), text: WELCOME_TEXT, sender: "ai", time: now() },
      time: now(),
    },
  ]);
  const [history, setHistory] = useState<
    { role: string; parts: { text: string }[] }[]
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [modalData, setModalData] = useState<YahooFinanceData | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const pushItem = useCallback((item: ConvItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const addSimple = useCallback(
    (text: string, sender: "user" | "ai") => {
      pushItem({
        id: uid(),
        type: "simple",
        msg: { id: uid(), text, sender, time: now() },
        time: now(),
      });
    },
    [pushItem]
  );

  const applyCompanyData = useCallback(
    (company: CompanyData) => {
      updateFinancialData({
        dc_ratio: company.dc_ratio ?? undefined,
        effective_tax_rate: company.effective_tax_rate ?? undefined,
        beta_levered: company.beta_levered,
        beta_unlevered: company.beta_unlevered ?? undefined,
      });
      addSimple(
        `📊 Datos de ${company.company_name} (${company.ticker}) aplicados al formulario exitosamente.`,
        "ai"
      );
    },
    [addSimple]
  ); // eslint-disable-line

  // Función para inyectar valores en un input controlado por React
  const updateFinancialData = (financialData: FinancialData) => {
    const fire = (inputName: string, value: string) => {
      // 1. Buscamos el input por su atributo "name"
      const el = document.querySelector(
        `input[name="${inputName}"]`
      ) as HTMLInputElement | null;

      if (el) {
        // 2. Extraemos el setter original de HTML (React bloquea el set normal)
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;

        // 3. Forzamos el cambio de valor
        nativeInputValueSetter?.call(el, value);

        // 4. Lanzamos los eventos para que KapitalPage vea el cambio
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        console.warn(`No se encontró el input con name: ${inputName}`);
      }
    };

    // Insertamos el Beta Desapalancado (BOA)
    if (financialData.beta_unlevered != null) {
      fire("beta_unlevered", financialData.beta_unlevered.toFixed(2));
      setIsOpen(false);
    }
  };

  const updateBetaValue = useCallback(
    (newBeta: number) => {
      const selectors = [
        'input[name="beta"]',
        "#betaInput",
        'input[name*="beta" i]',
        'input[name="beta_unlevered"]',
        'input[name="beta_levered"]',
      ];
      let found = false;
      for (const sel of selectors) {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        if (el) {
          el.value = String(newBeta);
          el.dispatchEvent(new Event("change", { bubbles: true }));
          found = true;
          break;
        }
      }
      if (found) {
        addSimple(`Beta actualizado a ${newBeta} exitosamente.`, "ai");
      } else {
        addSimple(
          `Para análisis sectorial, el beta ${newBeta} se aplicará como referencia.`,
          "ai"
        );
      }
    },
    [addSimple]
  );

  const analyzeYahooTickers = useCallback(
    async (tickers: string[]) => {
      addSimple("Buscando empresas comparables en el mercado...", "ai");
      setLoading(true);
      try {
        /*const res = await fetch("/api/analyze-companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tickers }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: YahooFinanceData = await res.json();
        if (data.success && data.valid_companies?.length) {
          pushItem({ id: uid(), type: "yahoo", yahooData: data, time: now() });
        } else {
          addSimple(
            "⚠️ No se pudieron obtener datos válidos de Yahoo Finance.",
            "ai"
          );
        }*/
        // Retraso simulado
        await new Promise((resolve) => setTimeout(resolve, 300));

        let sumBetaUnlevered = 0;

        // Datos de prueba para cada ticker
        const mockCompanies: CompanyData[] = tickers.map((ticker) => {
          const randomBoa = 0.7 + Math.random() * 0.6; // Entre 0.7 y 1.3
          sumBetaUnlevered += randomBoa;
          return {
            ticker: ticker,
            company_name: `Empresa Corp ${ticker}`,
            country: "USA",
            sector: externalFormData.sector || "General",
            dc_ratio: 0.25,
            effective_tax_rate: 0.21,
            beta_levered: randomBoa * 1.2,
            beta_unlevered: randomBoa,
          };
        });

        const avgBeta = sumBetaUnlevered / mockCompanies.length;

        const data: YahooFinanceData = {
          success: true,
          valid_companies: mockCompanies,
          group_statistics: {
            avg_beta_unlevered: avgBeta,
            avg_dc_ratio: 0.25,
            avg_tax_rate: 0.21,
          },
        };

        if (data.success && data.valid_companies?.length) {
          pushItem({ id: uid(), type: "yahoo", yahooData: data, time: now() });
        } else {
          addSimple(
            "No se pudieron obtener datos válidos de Yahoo Finance.",
            "ai"
          );
        }
      } catch (e: any) {
        addSimple(`❌ Error analizando empresas: ${e.message}`, "ai");
      } finally {
        setLoading(false);
      }
    },
    [addSimple, pushItem]
  );
  const callChatbotAPI = useCallback(
    async (userMessage: string) => {
      // Bloque de intercepcion para depuracion local
      setLoading(true);
      try {
        const payloadToVerify = {
          message: userMessage,
          history: history,
          form_data: externalFormData,
        };

        const data = await MainService.sendChatMessage(payloadToVerify);

        // 1. Mostrar la respuesta de texto de la IA (limpia de tags técnicos)
        if (data.text) {
          addSimple(data.text, "ai");
        }

        // 2. Si la IA detectó empresas, desencadenar la generación de la tabla/modal
        if (data.tickers && data.tickers.length > 0) {
          analyzeYahooTickers(data.tickers);
        }

        // 3. Actualizar el historial de conversación
        if (data.raw_history_appends) {
          setHistory((prev) => [...prev, ...data.raw_history_appends]);
        }
      } catch (e: any) {
        addSimple("Error de conexión con el servidor.", "ai");
      } finally {
        setLoading(false);
      }
    },
    [history, addSimple, analyzeYahooTickers, externalFormData]
  );
  const sendMessage = useCallback(() => {
    const msg = input.trim();
    if (!msg || loading) return;
    addSimple(msg, "user");
    setInput("");
    callChatbotAPI(msg);
  }, [input, loading, addSimple, callChatbotAPI]);

  const clearHistory = () => {
    setHistory([]);
    setItems([
      {
        id: uid(),
        type: "simple",
        msg: { id: uid(), text: WELCOME_TEXT, sender: "ai", time: now() },
        time: now(),
      },
    ]);
  };

  // Variables para la interfaz de inicio
  const SUGGESTIONS = [
    "Analiza mi beta actual",
    "Sugiere empresas comparables",
    "Calcula un nuevo beta",
  ];

  // Consideramos "vacío" si solo está el mensaje de bienvenida de Betito
  const isEmpty = items.length <= 1;

  return (
    <>
      <style>{`
        /* Scrollbar invisible hasta que se usa */
        .chat-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>

      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
        className={`cursor-pointer fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-valora-primary text-white shadow-xl shadow-valora-primary/30 transition-all hover:scale-105 active:scale-95 ${
          isOpen ? "scale-90 opacity-0 pointer-events-none" : ""
        }`}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Ventana del Chatbot */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-105 flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-gray-50 shadow-2xl transition-all duration-300 h-[min(650px,calc(100vh-3rem))] ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {/* Header tipo Píldora Flotante */}
        <div className="relative flex w-full items-start justify-between px-4 pt-4 pb-2 z-10">
          {/* Píldora Central */}
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-valora-primary text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">
              Betito WACC
            </span>
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-1.5 my-auto">
            <button
              onClick={clearHistory}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-green-600 transition-colors hover:bg-gray-200/80 shadow-sm border"
              title="Reiniciar conversación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-red-600 transition-colors hover:bg-valora-primary/20 shadow-sm border"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="chat-scroll flex-1 overflow-y-auto px-4 pb-2 pt-2">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-200 rotate-3">
                <Sparkles className="h-8 w-8 text-valora-primary" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-800">
                Hola, soy Betito
              </h3>
              <p className="mx-6 mt-2 mb-6 text-[13px] text-gray-500 leading-relaxed">
                Tu asistente experto en cálculo WACC y análisis sectorial. ¿En
                qué puedo ayudarte?
              </p>
              <div className="flex w-full flex-col gap-2.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (loading) return;
                      addSimple(s, "user");
                      callChatbotAPI(s);
                    }}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left text-[13.5px] font-medium text-gray-700 shadow-sm transition-all hover:border-valora-primary/50 hover:shadow-md"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 pb-4">
              {items.map((item) => {
                // 1. Mensajes Simples
                if (item.type === "simple" && item.msg) {
                  const isUser = item.msg.sender === "user";
                  return (
                    <div
                      key={item.id}
                      className={`flex w-full animate-in slide-in-from-bottom-2 fade-in duration-300 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {isUser ? (
                        // Burbuja de Usuario
                        <div className="flex max-w-[85%] flex-col items-end">
                          <div className="rounded-4xl rounded-br-sm bg-[#0066FF] px-4 py-2.5 text-[14px] text-white shadow-sm">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {item.msg.text}
                            </p>
                          </div>
                          <span className="mt-1 mr-1 text-[10px] text-gray-400 font-medium">
                            Read · {item.msg.time}
                          </span>
                        </div>
                      ) : (
                        // Burbuja del Bot
                        <div className="flex max-w-[90%] gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-valora-primary text-white shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col items-start w-full overflow-hidden">
                            <div className="rounded-4xl rounded-tl-sm border border-gray-100 bg-white px-4 py-2.5 text-[14px] text-gray-800 shadow-sm max-w-full">
                              <p className="whitespace-pre-wrap leading-relaxed wrap-break-word break-all">
                                {item.msg.text}
                              </p>
                            </div>
                            <span className="mt-1 ml-1 text-[10px] text-gray-400 font-medium">
                              {item.msg.time}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // 2. Resultados Yahoo y Beta
                if (item.type === "yahoo" && item.yahooData) {
                  return (
                    <div
                      key={item.id}
                      className="flex max-w-[95%] gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-valora-primary text-white shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex w-full flex-col items-start">
                        <div className="w-full rounded-2xl rounded-tl-sm border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                          <p className="text-[13.5px] text-gray-700 leading-relaxed">
                            Hemos procesado los datos y encontrado{" "}
                            <strong className="text-valora-primary">
                              {item.yahooData.valid_companies.length} empresas
                            </strong>{" "}
                            comparables con sus respectivos betas desapalancados
                            (BOA).
                          </p>
                          <button
                            onClick={() => setModalData(item.yahooData || null)}
                            className="bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-valora-primary transition-colors w-full cursor-pointer shadow-sm"
                          >
                            Ver tabla de empresas
                          </button>
                        </div>
                        <span className="mt-1 ml-1 text-[10px] text-gray-400 font-medium">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (item.type === "beta" && item.betaData) {
                  return (
                    <div
                      key={item.id}
                      className="flex max-w-[95%] gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex w-full flex-col items-start">
                        <div className="w-full rounded-4xl rounded-tl-sm border border-gray-100 bg-white p-3.5 shadow-sm">
                          <BetaUpdateCard
                            response={item.betaData.response}
                            newBeta={item.betaData.newBeta}
                            onUpdate={updateBetaValue}
                          />
                        </div>
                        <span className="mt-1 ml-1 text-[10px] text-gray-400 font-medium">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Indicador de "Escribiendo..." */}
              {loading && items[items.length - 1]?.msg?.sender === "user" && (
                <div className="flex max-w-[85%] gap-2.5 animate-in fade-in">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-4xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Área de Input */}
        <div className="px-4 pb-5 pt-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-end gap-2 rounded-full border border-gray-400 bg-white p-1.5 pr-2 shadow-sm transition-all focus-within:border-valora-primary/80 focus-within:shadow-md"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Write a message..."
              rows={1}
              className="chat-scroll ml-2 flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 mb-0.5"
              style={{ maxHeight: 100 }}
            />

            {/* Botón de Enviar (Flecha hacia arriba) */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
              className="mb-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-500 transition-all hover:bg-gray-300 active:scale-95 disabled:opacity-50 disabled:hover:bg-gray-200 not-disabled:bg-valora-primary not-disabled:text-white not-disabled:hover:bg-valora-primary/90"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      {/* --- MODAL --- */}
      {modalData && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-valora-primary" />
                Empresas Comparables
              </h3>
              <button
                onClick={() => setModalData(null)}
                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <YahooResults
                data={modalData}
                isWaccCalculated={isWaccCalculated || false}
                onApply={(company) => {
                  applyCompanyData(company);
                  setModalData(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
