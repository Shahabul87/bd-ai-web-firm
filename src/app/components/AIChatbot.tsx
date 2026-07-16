'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

// Stage 2 i18n: the canned Q&A now lives in messages/*.json. `id` is a stable,
// code-owned key (never translated); `keywords` and `response` are per-locale so
// the matcher below (lowerInput.includes(keyword)) becomes locale-aware for free.
interface ChatbotQA {
  id: string;
  keywords: string[];
  response: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = useTranslations('Chatbot');
  const qa = t.raw('qa') as ChatbotQA[];
  const quickQuestions = t.raw('quickQuestions') as string[];
  const welcomeText = t('welcome');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: 'welcome',
          text: welcomeText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }, 500);
    }
  }, [isOpen, messages.length, welcomeText]);

  const findResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Locale-agnostic once keywords are per-locale: iterate the Q&A in order and
    // return the first entry whose keyword list matches the (lowercased) input.
    for (const entry of qa) {
      if (entry.keywords.some(keyword => lowerInput.includes(keyword))) {
        return entry.response;
      }
    }

    return t('fallback');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time with fixed delay
    setTimeout(() => {
      const response = findResponse(inputText);
      const botMessage: Message = {
        id: `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000); // Fixed 2 second delay to avoid hydration issues
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 border border-signal-dim bg-signal text-ink-950 shadow-lg transition-colors duration-150 hover:bg-signal-dim"
        aria-label={t('openLabel')}
      >
        {isOpen ? (
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-ink-900 border border-line shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-line bg-ink-950 p-4 text-bone">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('headerTitle')}</h3>
                <p className="text-sm opacity-90">{t('headerSubtitle')}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 bg-signal rounded-full animate-pulse"></div>
                <span className="text-xs">{t('onlineStatus')}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 ${
                    message.sender === 'user'
                      ? 'bg-signal text-ink-950'
                      : 'bg-ink-800 text-bone border border-line'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.sender === 'user' ? 'text-ink-950' : 'text-steel'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-ink-800 border border-line p-3 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-steel rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-steel rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-steel rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-line">
              <div className="text-xs text-steel mb-2">{t('quickQuestionsLabel')}</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(question);
                      setTimeout(sendMessage, 100);
                    }}
                    className="text-xs px-3 py-1 bg-ink-800 hover:bg-line text-bone rounded-full transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-line">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('inputPlaceholder')}
                aria-label={t('inputAriaLabel')}
                className="flex-1 bg-ink-800 border border-line rounded-full px-3 sm:px-4 py-2 text-bone text-xs sm:text-sm focus:outline-none focus:border-signal transition-colors duration-200"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                aria-label={t('sendLabel')}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  inputText.trim() && !isTyping
                    ? 'bg-signal text-ink-950 hover:bg-signal-dim'
                    : 'bg-ink-800 text-steel cursor-not-allowed'
                }`}
              >
                {/* Horizontal paper-plane = unambiguous "send" (the prior upward
                    glyph read like a warning triangle). */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.769 59.769 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}