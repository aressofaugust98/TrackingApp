import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { getChatHistory, sendChatMessage } from '../services/chatService';

const createWelcomeMessage = () => ({
  id: 1,
  text: 'Xin chào! Tôi là trợ lý AI. Tôi có thể hỗ trợ bạn theo dõi tài chính, giao dịch và báo cáo.',
  sender: 'ai',
});

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (character) {
          return '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([createWelcomeMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const nextMessageIdRef = useRef(2);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isOpen) {
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        const decoded = token ? decodeJWT(token) : null;
        console.log('Debug - Decoded Token:', decoded);

        const resolvedUserId = decoded?.id || decoded?.user_id || decoded?.userId || decoded?.sub;
        const currentUserId = Number.parseInt(resolvedUserId, 10);

        console.log('Debug - Current userId:', currentUserId);

        if (!Number.isInteger(currentUserId)) {
          console.warn('Missing userId!');
          return;
        }

        const historyData = await getChatHistory(currentUserId);
        console.log('Debug - Fetched History:', historyData);

        if (!Array.isArray(historyData) || historyData.length === 0) {
          setMessages([createWelcomeMessage()]);
          return;
        }

        const mappedHistory = historyData.map((item) => ({
          id: item.id,
          text: item.message,
          sender: item.role === 'assistant' ? 'ai' : 'user',
        }));

        setMessages(mappedHistory);
      } catch (error) {
        console.error('Debug - History fetch failed:', error);
      }
    };

    fetchHistory();
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userMessageText = inputValue.trim();
    if (!userMessageText) {
      return;
    }

    const userMessage = {
      id: nextMessageIdRef.current,
      text: userMessageText,
      sender: 'user',
    };

    nextMessageIdRef.current += 1;
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiReply = await sendChatMessage(userMessageText);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: aiReply,
          sender: 'ai',
        },
      ]);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          text: 'Xin lỗi, tôi đang gặp sự cố kết nối với máy chủ AI.',
          sender: 'ai',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen ? (
        <div className="w-[min(92vw,24rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/80">Assistant</p>
              <h2 className="mt-1 text-lg font-semibold">Trợ lý AI</h2>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Đóng chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-104 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'rounded-br-sm bg-slate-900 text-white'
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  AI đang suy nghĩ...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-4">
            <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-slate-400 focus-within:bg-white">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                aria-label="Nhập tin nhắn"
              />

              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!inputValue.trim()}
                aria-label="Gửi tin nhắn"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-slate-950 via-slate-900 to-cyan-700 text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] ring-1 ring-white/20 transition hover:scale-105 hover:shadow-[0_24px_60px_rgba(15,23,42,0.45)]"
        aria-label={isOpen ? 'Thu gọn chatbot' : 'Mở chatbot'}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default Chatbot;