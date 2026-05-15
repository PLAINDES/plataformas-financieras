import { useState, useRef, useEffect, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  type CompanyData,
  type YahooFinanceData,
  type Message,
  type ChatbotProps,
} from "./chatbot.interfaces";
import { Bot, ArrowUp, RotateCcw, X, Sparkles, ArrowRight } from "lucide-react";
import { YahooResults, BetaUpdateCard } from "./ChatbotUI";
import {
  handleNumberValidation,
  handleNumberKeyDown,
} from "@/shared/utils/inputValidators";

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

const sharedState = {
  items: [
    {
      id: uid(),
      type: "simple" as const,
      msg: {
        id: uid(),
        text: WELCOME_TEXT,
        sender: "ai" as const,
        time: now(),
      },
      time: now(),
    },
  ] as ConvItem[],
  history: [] as { role: string; parts: { text: string }[] }[],
  input: "",
  betaInput: "",
  modalData: null as YahooFinanceData | null,
};

export const Chatbot: React.FC<ChatbotProps> = ({
  formData: externalFormData,
  isWaccCalculated,
  isOpen,
  setIsOpen,
  onCalculateWacc,
}) => {
  const [items, setItemsState] = useState<ConvItem[]>(sharedState.items);
  const [history, setHistoryState] = useState(sharedState.history);

  const [input, setInputState] = useState(sharedState.input);
  const [betaInput, setBetaInputState] = useState(sharedState.betaInput);
  const [modalData, setModalDataState] = useState<YahooFinanceData | null>(
    sharedState.modalData
  );

  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const setItems = useCallback(
    (val: ConvItem[] | ((prev: ConvItem[]) => ConvItem[])) => {
      setItemsState((prev: ConvItem[]) => {
        const next = typeof val === "function" ? val(prev) : val;
        sharedState.items = next;
        return next;
      });
    },
    []
  );

  const setHistory = useCallback((val: any) => {
    setHistoryState((prev: { role: string; parts: { text: string }[] }[]) => {
      const next = typeof val === "function" ? val(prev) : val;
      sharedState.history = next;
      return next;
    });
  }, []);

  const setInput = useCallback((val: string | ((prev: string) => string)) => {
    setInputState((prev: string) => {
      const next = typeof val === "function" ? val(prev) : val;
      sharedState.input = next;
      return next;
    });
  }, []);

  const setBetaInput = useCallback(
    (val: string | ((prev: string) => string)) => {
      setBetaInputState((prev: string) => {
        const next = typeof val === "function" ? val(prev) : val;
        sharedState.betaInput = next;
        return next;
      });
    },
    []
  );

  const setModalData = useCallback(
    (
      val:
        | YahooFinanceData
        | null
        | ((prev: YahooFinanceData | null) => YahooFinanceData | null)
    ) => {
      setModalDataState((prev: YahooFinanceData | null) => {
        const next = typeof val === "function" ? val(prev) : val;
        sharedState.modalData = next;
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [items, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        // Solo hace focus si la pantalla es mayor a 500px (evita abrir teclado en móviles)
        if (typeof window !== "undefined" && window.innerWidth > 500) {
          inputRef.current?.focus();
        }
      }, 100);
    }
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
      if (company.beta_unlevered != null) {
        // Formatea a 4 decimales
        const formattedBeta = Number(company.beta_unlevered).toFixed(4);
        setBetaInput(formattedBeta);

        addSimple(
          `Beta de ${company.company_name} (${company.ticker}) seleccionado.`,
          "ai"
        );
      }
    },
    [addSimple]
  ); // eslint-disable-line

  const applyDirectBeta = useCallback(
    (newBeta: number) => {
      setBetaInput(Number(newBeta).toFixed(4));
      addSimple(
        `Beta actualizado a ${newBeta} en el formulario. Haz clic en Calcular.`,
        "ai"
      );
    },
    [addSimple]
  );

  const analyzeYahooTickers = useCallback(
    async (tickers: string[]) => {
      addSimple("Buscando empresas comparables en el mercado...", "ai");
      setLoading(true);
      try {
        const res = await MainService.analyzeCompanies(tickers);

        if (res.success && res.valid_companies?.length) {
          pushItem({ id: uid(), type: "yahoo", yahooData: res, time: now() });
        } else {
          addSimple(
            "No se pudieron obtener datos válidos de Yahoo Finance para los tickers proporcionados.",
            "ai"
          );
        }
      } catch (e: any) {
        addSimple(`Error analizando empresas: ${e.message}`, "ai");
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
          setHistory((prev: { role: string; parts: { text: string }[] }[]) => [
            ...prev,
            ...data.raw_history_appends,
          ]);
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

  const handleRemoveTicker = useCallback((tickerToRemove: string) => {
    // Actualiza el historial
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.type === "yahoo" && item.yahooData) {
          const updatedCompanies = item.yahooData.valid_companies.filter(
            (c) => c.ticker !== tickerToRemove
          );
          return {
            ...item,
            yahooData: {
              ...item.yahooData,
              valid_companies: updatedCompanies,
            },
          };
        }
        return item;
      })
    );

    // Actualiza el modalData que está actualmente abierto en pantalla
    setModalData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        valid_companies: prev.valid_companies.filter(
          (c) => c.ticker !== tickerToRemove
        ),
      };
    });
  }, []);

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
  ];

  // Consideramos "vacío" si solo está el mensaje de bienvenida de Betito
  const isEmpty = items.length <= 1;

  return (
    <section className="relative flex flex-col w-full sm:w-95 lg:w-150 max-w-full">
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
        className={`px-4 py-2.5 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer ${
          isOpen
            ? "bg-gray-900 text-white rounded-t-xl rounded-b-none border border-b-0 border-gray-200"
            : "bg-valora-primary text-white rounded-xl hover:bg-valora-secondary"
        }`}
      >
        <span className="flex items-center gap-3 text-sm sm:text-lg font-semibold leading-snug">
          <Sparkles className="h-5 w-5 shrink-0" />
          Encuentra tu Costo de Capital usando el Beta específico de tu sector
        </span>
        {isOpen ? (
          <X className="h-5 w-5 shrink-0 opacity-80 hover:opacity-100" />
        ) : (
          <ArrowRight className="h-5 w-5 shrink-0" />
        )}
      </button>
      {/* Ventana del Chatbot */}
      <div
        className={`absolute top-full left-0 right-0 z-10 flex w-full flex-col overflow-hidden rounded-b-4xl border border-t-0 border-gray-200 bg-gray-50 shadow-2xl transition-all duration-300 h-[min(650px,calc(100vh-140px))] origin-top ${
          isOpen
            ? "scale-y-100 opacity-100"
            : "pointer-events-none scale-y-0 opacity-0"
        }`}
      >
        {/* Header tipo Píldora Flotante */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          {/* Píldora izquierda */}
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-valora-primary text-white">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">
              Betito WACC
            </span>
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
          </div>
          <button
            onClick={clearHistory}
            className="my-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-green-600 transition-colors hover:bg-gray-200/80 shadow-sm border"
            title="Reiniciar conversación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Área de Mensajes */}
        <div
          ref={chatContainerRef}
          className="chat-scroll flex-1 overflow-y-auto px-4 pb-2 pt-2"
        >
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-200 rotate-3">
                <Bot className="h-8 w-8 text-valora-primary" />
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
                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left text-xs sm:text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-valora-primary/50 hover:shadow-md"
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
                          <div className="rounded-4xl rounded-br-sm bg-[#0066FF] px-4 py-2.5 text-xs sm:text-sm text-white shadow-sm">
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
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col items-start w-full overflow-hidden text-left">
                            <div className="rounded-4xl rounded-tl-sm border border-gray-100 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-800 shadow-sm max-w-full">
                              <p className=" leading-relaxed wrap-break-word break-all">
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
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex w-full flex-col items-start">
                        <div className="w-full rounded-2xl rounded-tl-sm border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                          <p className="text-left text-xs sm:text-sm text-gray-700 leading-relaxed">
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
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex w-full flex-col items-start">
                        <div className="w-full rounded-4xl rounded-tl-sm border border-gray-100 bg-white p-3.5 shadow-sm">
                          <BetaUpdateCard
                            response={item.betaData.response}
                            newBeta={item.betaData.newBeta}
                            onUpdate={applyDirectBeta}
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
                    <Bot className="h-3.5 w-3.5" />
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

        {/* Footer: Formulario de Beta y WACC */}
        <div className="px-5 py-4 bg-white flex items-end gap-3 shrink-0 border-t border-slate-400">
          <div className="flex flex-col gap-1.5 w-2/5">
            <label className="text-[11px] sm:text-sm font-bold text-slate-400 uppercase tracking-wide text-left">
              BETA DESAPALANCADO:
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.0001"
              value={betaInput}
              className="w-22 text-base px-3 py-2 font-semibold text-slate-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white border border-gray-300 rounded-lg"
              onKeyDown={(e) => handleNumberKeyDown(e, false)}
              onChange={(e) => {
                handleNumberValidation(
                  e,
                  { maxDecimals: 4, max: 3, min: 0 },
                  (validEvent) => {
                    setBetaInput(validEvent.target.value);
                  }
                );
              }}
            />
          </div>
          <button
            type="button"
            disabled={!betaInput || loading}
            onClick={() => onCalculateWacc(betaInput)}
            className="m-auto flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 cursor-pointer uppercase tracking-wide h-12 sm:h-10"
          >
            Cálcula y compara tu WACC
          </button>
        </div>
      </div>
      {/* --- MODAL --- */}
      {modalData && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[90dvw] max-w-2xl h-[80dvh] sm:max-h-[85dvh] overflow-hidden flex flex-col animate-in zoom-in-95 justify-between">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-valora-primary" />
                Empresas Comparables
              </h3>
              <button
                onClick={() => setModalData(null)}
                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-full p-3 sm:p-5 overflow-y-auto">
              <YahooResults
                data={modalData}
                isWaccCalculated={isWaccCalculated || false}
                onApply={(company) => {
                  applyCompanyData(company);
                  setModalData(null);
                }}
                onRemove={handleRemoveTicker}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Chatbot;
