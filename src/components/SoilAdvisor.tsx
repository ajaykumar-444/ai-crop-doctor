import React, { useEffect, useRef } from "react";
import { HelpCircle, RefreshCw, Send } from "lucide-react";
import { Language, ChatMessage } from "../types";

const CHAT_PROMPTS = {
  en: [
    "How do I prepare organic liquid compost (Jeevamrutha)?",
    "What is the best NPK fertilizer ratio for dry soil?",
    "Explain low-cost organic remedies for Cotton mealybugs.",
    "Draft drip irrigation schedule for high temperature clay soil.",
  ],
  te: [
    "జీవామృతం సేంద్రీయ ఎరువును ఎలా తయారు చేయాలి?",
    "పొడి నేలకు సరిపోయే ఉత్తమ NPK ఎరువుల నిష్పత్తి ఏమిటి?",
    "పత్తి తెగుళ్ళకు తక్కువ ఖర్చుతో కూడిన సేంద్రీయ నివారణల జాబితా.",
    "అధిక ఉష్ణోగ్రత గల నల్లటి నేలలో డ్రిప్ నీటి పారుదల ప్రణాళిక.",
  ],
  hi: [
    "जीवामृत जैविक खाद तैयार करने की सही विधि क्या है?",
    "शुष्क मिट्टी के लिए सर्वोत्तम एनपीके उर्वरक अनुपात क्या है?",
    "कपास के कीटों के लिए कम लागत वाले जैविक उपचार बताएं।",
    "उच्च तापमान वाली मिट्टी में ड्रिप सिंचाई की अनुसूची।",
  ],
};

interface SoilAdvisorProps {
  lang: Language;
  chatHistory: ChatMessage[];
  chatInput: string;
  setChatInput: (s: string) => void;
  sendingChat: boolean;
  chatError: string;
  handleSendChat: (textToSend?: string) => Promise<void>;
  activeTranslation: any;
}

export const SoilAdvisor: React.FC<SoilAdvisorProps> = ({
  lang,
  chatHistory,
  chatInput,
  setChatInput,
  sendingChat,
  chatError,
  handleSendChat,
  activeTranslation,
}) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat automatically when history changes
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  return (
    <section className="bg-emerald-950 text-white rounded-3xl p-6 border border-emerald-900 flex flex-col h-[520px] shadow-lg relative" id="advisor-chat-section">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-t-3xl select-none"></div>

      {/* Chat Header */}
      <div className="border-b border-emerald-800 pb-3 mb-3">
        <span className="bg-emerald-800 text-emerald-200 text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-emerald-700/60 shadow-sm">
          MITTI & FERTILITY AI
        </span>
        <h2 className="text-lg font-bold text-white mt-1.5 flex items-center leading-none">
          <HelpCircle className="w-4 h-4 mr-2 text-emerald-400" />
          {activeTranslation.chatTitle}
        </h2>
        <p className="text-[11px] text-emerald-300 font-light mt-0.5 leading-snug">
          {activeTranslation.chatSubtitle}
        </p>
      </div>

      {/* Live messages window */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-1 py-1 scrollbar-thin scrollbar-thumb-emerald-800" id="chat-messages-container">
        {chatHistory.map((item) => {
          const isAssistant = item.role === "assistant";
          return (
            <div
              key={item.id}
              className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  isAssistant
                    ? "bg-emerald-900/60 border border-emerald-800 text-emerald-50 shadow-inner"
                    : "bg-emerald-600 text-white rounded-br-none shadow"
                }`}
              >
                {item.content}
              </div>
            </div>
          );
        })}
        {sendingChat && (
          <div className="flex justify-start">
            <div className="bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl px-4 py-2.5 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Agronomist typing...</span>
            </div>
          </div>
        )}
        {chatError && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-2.5 rounded-xl text-[10px]">
            {chatError}
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* QUICK FARMING SUGGESTIONS PROMPTS */}
      <div className="mt-3 border-t border-emerald-900 pt-3 shrink-0" id="chat-prompts-bar">
        <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase mb-1.5">
          {activeTranslation.chatPromptsLabel}
        </p>
        <div className="flex flex-col gap-1.5">
          {CHAT_PROMPTS[lang].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendChat(prompt)}
              disabled={sendingChat}
              className="text-left text-[11px] bg-emerald-900/40 border border-emerald-800/40 hover:bg-emerald-900 text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-lg transition duration-150 line-clamp-1 leading-none select-none cursor-pointer focus:outline-none"
              id={`quick-prompt-${pIdx}`}
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input keyboard bar */}
      <div className="mt-3 flex items-center space-x-2 shrink-0 animate-fade-in" id="chat-input-row">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendChat();
          }}
          disabled={sendingChat}
          className="flex-grow bg-emerald-900/50 border border-emerald-800 text-white placeholder-emerald-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
          placeholder={activeTranslation.chatPlaceholder}
          id="chat-field-keyboard"
        />
        <button
          onClick={() => handleSendChat()}
          disabled={!chatInput.trim() || sendingChat}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-900 disabled:text-emerald-700 text-white p-2 rounded-xl transition shadow cursor-pointer focus:outline-none"
          title={activeTranslation.chatSend}
          id="chat-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
export default SoilAdvisor;
