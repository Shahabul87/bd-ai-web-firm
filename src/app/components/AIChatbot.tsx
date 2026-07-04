'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

const knowledgeBase = {
  services: {
    keywords: ['services', 'what do you do', 'capabilities', 'offerings'],
    response: "We're an AI agent development studio. Our AI agents build your software, with human review on every release. We offer:\n\n• Custom AI agents built for your workflows\n• AI-built websites & web applications\n• Android apps (Kotlin, Jetpack Compose)\n• iOS apps (Swift, SwiftUI)\n• AI agent integration into your existing systems\n• Ongoing support & maintenance\n\nWould you like to know more about any specific service?"
  },
  pricing: {
    keywords: ['price', 'cost', 'pricing', 'budget', 'quote'],
    response: "Our pricing is tailored to each project's scope and complexity. We offer:\n\n• Free initial consultation\n• Custom project quotes\n• Flexible engagement options\n• Ongoing support packages\n\nI'd be happy to connect you with our team for a personalized quote. What type of project are you considering?"
  },
  technologies: {
    keywords: ['technology', 'tech stack', 'tools', 'frameworks'],
    response: "We build with a modern, production-grade stack:\n\n**Web:** React, Next.js, Node.js, TypeScript\n**Android:** Kotlin, Jetpack Compose\n**iOS:** Swift, SwiftUI\n**AI:** custom AI agents integrated into your build and product workflows\n\nWe choose the right tools for your specific project needs."
  },
  portfolio: {
    keywords: ['portfolio', 'projects', 'examples', 'work', 'case studies'],
    response: "Here are products we've built:\n\n• **TaxoMind** — AI-powered learning platform\n• **TaxoMind Schools** — learning platform for schools\n• **FinCoach AI** — personal finance made simple\n• **MathPhysics** — interactive STEM learning\n\nVisit our Portfolio and Case Studies pages for the full stories!"
  },
  contact: {
    keywords: ['contact', 'reach', 'email', 'phone', 'meeting', 'location', 'where'],
    response: "I'd love to connect you with our team! Here's how to reach us:\n\n📧 **Email:** hello@craftsai.org\n💬 **WhatsApp:** tap the green button at the bottom-right\n📍 **Based in:** Dhaka, Bangladesh — working with clients worldwide\n\nOr click the 'Get a Quote' button to start a free consultation!"
  },
  timeline: {
    keywords: ['timeline', 'duration', 'how long', 'delivery', 'time'],
    response: "Project timelines depend on scope. Typical ranges:\n\n• **Website / landing site:** 1-4 weeks\n• **Custom web application:** 4-12 weeks\n• **Mobile app (Android/iOS):** 6-14 weeks\n• **AI agent integration:** scoped per project\n\nWe'll give you a detailed timeline during your consultation."
  }
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          text: "👋 Hi! I'm AI Assistant from CraftsAI. I'm here to help you learn about our AI and web development services.\n\nYou can ask me about:\n• Our services and capabilities\n• Pricing and project timelines\n• Technologies we use\n• Portfolio and case studies\n• How to get started\n\nWhat would you like to know?",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }, 500);
    }
  }, [isOpen, messages.length]);

  const findResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check each knowledge base category
    for (const [, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
        return data.response;
      }
    }

    // Default responses for common patterns
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm here to help you learn about CraftsAI. What would you like to know about our AI and web development services?";
    }

    if (lowerInput.includes('help')) {
      return "I can help you with information about:\n\n• Our AI and web development services\n• Project pricing and timelines\n• Technologies and capabilities\n• Portfolio and case studies\n• Getting started with your project\n\nWhat specific area interests you most?";
    }

    if (lowerInput.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about our services? I'm here to help! 😊";
    }

    // Default response
    return "I'd be happy to help you with that! For detailed information about your specific needs, I recommend:\n\n• Checking our Services or Portfolio pages\n• Scheduling a free consultation with our team\n• Emailing us at hello@craftsai.org or messaging us on WhatsApp\n\nIs there anything specific about our AI, web, or mobile development services you'd like to know?";
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

  const quickQuestions = [
    "What services do you offer?",
    "How much does a project cost?",
    "What technologies do you use?",
    "Can I see your portfolio?",
    "How do I get started?"
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 border border-signal-dim bg-signal text-ink-950 shadow-lg transition-colors duration-150 hover:bg-signal-dim"
        aria-label="Open AI Chat Assistant"
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
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm opacity-90">CraftsAI</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 bg-signal rounded-full animate-pulse"></div>
                <span className="text-xs">Online</span>
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
              <div className="text-xs text-steel mb-2">Quick questions:</div>
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
                placeholder="Ask me anything..."
                aria-label="Chat message"
                className="flex-1 bg-ink-800 border border-line rounded-full px-3 sm:px-4 py-2 text-bone text-xs sm:text-sm focus:outline-none focus:border-signal transition-colors duration-200"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                aria-label="Send message"
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  inputText.trim() && !isTyping
                    ? 'bg-signal text-ink-950 hover:bg-signal-dim'
                    : 'bg-ink-800 text-steel cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}