import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'Bonjour Samar ! Je suis votre assistant Eco-Pilot BTP. Avez-vous besoin d\'aide pour vérifier les ratios de béton ou importer une feuille DPGF ?',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputVal('');

    setTimeout(() => {
      let botReply = "Je prends en compte votre demande sur la DPGF. Les quantitatifs et ratios sont vérifiés conformes au CCTP du projet Hôtel.";
      if (userText.toLowerCase().includes('béton') || userText.toLowerCase().includes('beton')) {
        botReply = "Le ratio moyen de béton armé pour l'infrastructure est de 95 kg d'acier HA/m³ et 165 €/m³ en C30/37.";
      } else if (userText.toLowerCase().includes('export')) {
        botReply = "Vous pouvez exporter le classeur Excel dans la Phase 5 (Export DPGF). Les formules de calcul sont automatiquement intégrées.";
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200 dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#1B4591] to-[#0394D7] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h4 className="text-xs font-bold">Assistant Eco-Pilot</h4>
                <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> En ligne
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 text-xs [scrollbar-width:thin]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#1B4591] text-white rounded-br-none'
                      : 'bg-[#F0F7FF] text-slate-800 rounded-bl-none dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-slate-100 p-2.5 flex gap-2 dark:border-slate-800">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Posez une question sur le projet..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#1B4591] p-2 text-white hover:bg-[#163a7a]"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4591] text-white shadow-xl transition-all hover:scale-105 hover:bg-[#163a7a] focus:outline-none focus:ring-4 focus:ring-[#1B4591]/30 active:scale-95"
        title="Ouvrir l'assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};
