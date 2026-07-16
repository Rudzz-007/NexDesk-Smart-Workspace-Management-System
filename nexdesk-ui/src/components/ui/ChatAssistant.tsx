import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, CornerDownLeft } from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  { id: 'book', text: 'How do I book a desk?' },
  { id: 'checkin', text: 'How does check-in work?' },
  { id: 'cancel', text: 'Can I cancel a booking?' },
  { id: 'cities', text: 'What cities are you in?' },
  { id: 'pricing', text: 'Is pricing transparent?' }
];

const CANNED_ANSWERS: Record<string, string> = {
  book: "To book a desk, search for your preferred city on the homepage or Browse page, choose a space, select your reservation date and time window, and click 'Book Now'. If you're not logged in, you'll be redirected to authenticate first.",
  checkin: "After booking, generate your check-in code on the Space Detail page. Scan the QR code or verify your physical presence within the 30-second window; otherwise, the system automatically auto-releases the hot desk to keep inventory open.",
  cancel: "Yes, you can cancel any confirmed booking. Go to My Bookings on your dashboard and click 'Cancel booking'. This triggers a DELETE request to cancel your reservation instantly and updates your dashboard.",
  cities: "NexDesk is active in India's top tech hubs, including Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Jaipur, Kochi, Chandigarh, and Indore.",
  pricing: "Yes, pricing is 100% transparent with no hidden fees. NexDesk uses a Linear Regression machine learning model to calculate final rates dynamically based on surge factors, zone pricing, and amenities.",
  support: "Our support team has been notified of your request. A representative will reach out to you via email shortly. Thank you for using NexDesk!"
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Initialize with greeting if empty
  useEffect(() => {
    const saved = localStorage.getItem('nexdesk_chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const greeting: Message = {
        id: 'greet',
        sender: 'bot',
        text: "Hi! Welcome to NexDesk. I can help answer common questions about workspace bookings, QR check-ins, and cancellations. What would you like to know?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([greeting]);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem('nexdesk_chat_history', JSON.stringify(newMsgs));
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleQuestionSelect = (questionId: string, questionText: string) => {
    if (isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMsgs = [...messages, userMsg];
    saveHistory(currentMsgs);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const answerText = CANNED_ANSWERS[questionId] || "I'm not sure how to answer that question. Feel free to choose another query.";
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveHistory([...currentMsgs, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearHistory = () => {
    const greeting: Message = {
      id: 'greet',
      sender: 'bot',
      text: "Hi! Welcome to NexDesk. I can help answer common questions about workspace bookings, QR check-ins, and cancellations. What would you like to know?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([greeting]);
    localStorage.removeItem('nexdesk_chat_history');
  };

  return (
    <div className="font-sans">
      {/* ─── Launcher Button (Fixed Bottom-Right) ─── */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            ref={launcherRef}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shadow-lg hover:bg-[#2563eb] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Open support chat"
            title="Open Support Chat"
          >
            <MessageCircle size={26} />
          </button>
        </div>
      )}

      {/* ─── Chat Panel (Full-Width Sheet on Mobile, Floating Panel on Desktop) ─── */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="NexDesk Chat Assistant"
          className="fixed inset-x-0 bottom-0 z-50 w-full sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[360px] bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl border border-[#e2e8f0] flex flex-col h-[80vh] sm:h-[500px] max-h-[600px] transition-all duration-200 ease-in-out transform origin-bottom"
        >
          {/* Header */}
          <div className="bg-[#3b82f6] text-white px-4 py-3.5 rounded-t-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">NexDesk Assistant</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Always Active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="text-xs text-blue-100 hover:text-white px-2 py-1 rounded bg-white/10 transition-colors"
                title="Clear Chat History"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close chat assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-[#e2e8f0] text-slate-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-[#e2e8f0] text-[#1e293b] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-[#94a3b8] block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-xs font-bold text-slate-600 shadow-xs">
                  <Bot size={13} />
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply chips */}
          <div className="p-3 border-t border-[#e2e8f0] bg-white space-y-2">
            <span className="text-[10px] font-bold text-[#64748b] block uppercase tracking-wider px-1">
              Select a Question:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pb-1">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  disabled={isTyping}
                  onClick={() => handleQuestionSelect(q.id, q.text)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-slate-50 hover:bg-slate-100 hover:border-[#cbd5e1] text-[11px] font-bold text-[#334155] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                >
                  {q.text}
                </button>
              ))}
              <button
                disabled={isTyping}
                onClick={() => handleQuestionSelect('support', 'Talk to support')}
                className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[11px] font-bold text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
              >
                Talk to support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
