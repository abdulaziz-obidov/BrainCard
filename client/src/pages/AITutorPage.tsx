import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { contentApi } from '../api/client';
import { speakWord } from '../components/FlashCardView';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const speakSentence = (text: string) => {
  if (!text) return;
  // Google Translate TTS (up to 200 chars)
  const safeText = text.length > 200 ? text.substring(0, 200) : text;
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(safeText)}`;
  const audio = new Audio(url);
  audio.play().catch(() => {
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  });
};

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your BrainCards AI Tutor. How can I help you with your English today?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (newMsg: string) => contentApi.chatWithAI(messages.slice(1), newMsg).then(res => res.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'model', content: data.data.response }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    }
  });

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    chatMutation.mutate(userMessage);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
            🤖
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">AI Tutor</h1>
            <p className="text-primary-100 text-xs">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speakSentence(msg.content)}
                    className="mt-2 text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                  >
                    🔊 Listen
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {chatMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message in English..."
            disabled={chatMutation.isPending}
            className="flex-1 px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-primary-500 rounded-xl transition-colors outline-none ring-2 ring-transparent focus:ring-primary-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
