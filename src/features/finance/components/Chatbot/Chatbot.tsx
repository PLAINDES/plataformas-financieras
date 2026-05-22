import { useState, useRef, useEffect, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import Markdown from "react-markdown";
import {
  type CompanyData,
  type YahooFinanceData,
  type Message,
  type ChatbotProps,
  type CompanyModalActions,
} from "./chatbot.interfaces";
import { Bot } from "lucide-react";
import {
  BetaUpdateCard,
  ChatbotHeader,
  ChatEmptyState,
  ChatTypingIndicator,
  ChatInputArea,
  ChatFooterForm,
} from "./ChatbotUI";
import { now, uid, WELCOME_TEXT, checkRateLimit } from "./chatbot.utils";

interface ConvItem {
  id: string;
  type: "simple" | "yahoo" | "beta";
  msg?: Message;
  yahooData?: YahooFinanceData;
  betaData?: { response: string; newBeta: number };
  time: string;
}

interface SharedStateType {
  items: ConvItem[];
  history: { role: string; parts: { text: string }[] }[];
  input: string;
  betaInput: string;
  loading: boolean;
}

const initialItems: ConvItem[] = [
  {
    id: uid(),
    type: "simple",
    msg: {
      id: uid(),
      text: WELCOME_TEXT,
      sender: "ai",
      time: now(),
    },
    time: now(),
  },
];

const sharedState: SharedStateType = {
  items: initialItems,
  history: [],
  input: "",
  betaInput: "",
  loading: false,
};

type Listener = () => void;
let listeners: Listener[] = [];
const notify = () => listeners.forEach((l) => l());

const setSharedState = <K extends keyof SharedStateType>(
  key: K,
  val: SharedStateType[K] | ((prev: SharedStateType[K]) => SharedStateType[K])
) => {
  // Ejecuta la funcion si es un callback, o asigna el valor directo
  sharedState[key] =
    typeof val === "function" ? (val as Function)(sharedState[key]) : val;
  notify();
};

const SUGGESTIONS = ["Analiza mi beta actual", "Sugiere empresas comparables"];

export const Chatbot: React.FC<ChatbotProps> = ({
  formData: externalFormData,
  isOpen,
  setIsOpen,
  onCalculateWacc,
  onOpenModal,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // Lee las variables directamente del estado global
  const { items, history, input, betaInput, loading } = sharedState;

  // 3. Redefinimos los setters para que actualicen el store global
  const setInput = (val: any) => setSharedState("input", val);
  const setBetaInput = (val: any) => setSharedState("betaInput", val);
  const setHistory = (val: any) => setSharedState("history", val);
  const setLoading = (val: any) => setSharedState("loading", val);
  const setItems = (val: any) => setSharedState("items", val);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    setSharedState("items", (prev: ConvItem[]) => [...prev, item]);
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

    if (!checkRateLimit()) {
      addSimple(
        "Has alcanzado el límite de 10 mensajes cada 3 minutos. Por favor, espera un momento para continuar.",
        "ai"
      );
      setInput("");
      return;
    }

    addSimple(msg, "user");
    setInput("");
    callChatbotAPI(msg);
  }, [input, loading, addSimple, callChatbotAPI]);

  const handleSuggestionClick = (s: string) => {
    if (loading) return;
    if (!checkRateLimit()) {
      addSimple(
        "Has alcanzado el límite de 10 mensajes cada 3 minutos. Por favor, espera un momento para continuar.",
        "ai"
      );
      return;
    }
    addSimple(s, "user");
    callChatbotAPI(s);
  };

  const handleRemoveTicker = useCallback((tickerToRemove: string) => {
    setItems((prevItems: ConvItem[]) =>
      prevItems.map((item: ConvItem) => {
        if (item.type === "yahoo" && item.yahooData) {
          const updatedCompanies = item.yahooData.valid_companies.filter(
            (c: CompanyData) => c.ticker !== tickerToRemove
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
      {/* Botón Flotante 
      <ChatbotToggler isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />*/}

      {/* Ventana del Chatbot */}
      <div
        className={`absolute top-full left-0 right-0 z-10 flex w-full flex-col overflow-hidden rounded-b-4xl border border-slate-100 transition-all duration-300 h-[min(650px,calc(100vh-140px))] origin-top ${
          isOpen
            ? "scale-y-100 opacity-100"
            : "pointer-events-none scale-y-0 opacity-0"
        }`}
      >
        {/* Header tipo Píldora Flotante */}
        <ChatbotHeader onClear={clearHistory} />
        {/* Área de Mensajes */}
        <div
          ref={chatContainerRef}
          className="chat-scroll flex-1 overflow-y-auto px-4 pb-2 pt-2"
        >
          {isEmpty ? (
            <ChatEmptyState
              suggestions={SUGGESTIONS}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            <div className="space-y-5 pb-4">
              {items.map((item: ConvItem) => {
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
                              <Markdown
                                components={{
                                  h3: ({ node, ...props }: any) => (
                                    <h3
                                      className="font-bold text-valora-primary mb-1 uppercase tracking-wide text-xs sm:text-sm"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }: any) => (
                                    <strong
                                      className="font-bold text-gray-900"
                                      {...props}
                                    />
                                  ),
                                  p: ({ node, ...props }: any) => (
                                    <p className="mb-2 last:mb-0" {...props} />
                                  ),
                                  ul: ({ node, ...props }: any) => (
                                    <ul
                                      className="list-disc pl-5 mb-2 space-y-1"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }: any) => (
                                    <li className="text-gray-800" {...props} />
                                  ),
                                }}
                              >
                                {item.msg.text}
                              </Markdown>
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
                            type="button"
                            onClick={() => {
                              if (!item.yahooData) return;
                              const modalActions: CompanyModalActions = {
                                onApplyCompany: applyCompanyData,
                                onRemoveTicker: handleRemoveTicker,
                              };
                              onOpenModal(item.yahooData, modalActions);
                            }}
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
                <ChatTypingIndicator />
              )}
            </div>
          )}
        </div>

        {/* Área de Input */}
        <ChatInputArea
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          inputRef={inputRef}
          loading={loading}
          sendMessage={sendMessage}
        />

        {/* Footer: Formulario de Beta y WACC */}
        <ChatFooterForm
          betaInput={betaInput}
          setBetaInput={setBetaInput}
          onCalculate={() => {
            onCalculateWacc(betaInput);
            setIsOpen(false);
          }}
          loading={loading}
        />
      </div>
    </section>
  );
};

export default Chatbot;
