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
    response: "We offer comprehensive AI and web development services including:\n\n• Machine Learning & Predictive Analytics\n• Natural Language Processing\n• Computer Vision & Image Recognition\n• AI-Powered Web Applications\n• Data Visualization & Dashboards\n• Intelligent Process Automation\n\nWould you like to know more about any specific service?"
  },
  pricing: {
    keywords: ['price', 'cost', 'pricing', 'budget', 'quote'],
    response: "Our pricing is tailored to each project's complexity and requirements. We offer:\n\n• Free initial consultation\n• Custom project quotes\n• Flexible payment plans\n• Ongoing support packages\n\nI'd be happy to connect you with our team for a personalized quote. What type of project are you considering?"
  },
  technologies: {
    keywords: ['technology', 'tech stack', 'tools', 'frameworks'],
    response: "We use cutting-edge technologies including:\n\n**AI/ML:** TensorFlow, PyTorch, Scikit-learn, OpenAI API\n**Web:** React, Next.js, Node.js, Python, TypeScript\n**Cloud:** AWS, Google Cloud, Azure\n**Databases:** PostgreSQL, MongoDB, Redis\n\nOur tech stack is chosen based on your specific project needs."
  },
  portfolio: {
    keywords: ['portfolio', 'projects', 'examples', 'work', 'case studies'],
    response: "We've successfully delivered projects across various industries:\n\n• E-commerce recommendation engines (47% sales increase)\n• Healthcare analytics platforms (99.2% accuracy)\n• Financial trading dashboards (87% prediction accuracy)\n• Manufacturing quality control AI (99.7% defect detection)\n\nCheck out our Portfolio page for detailed case studies!"
  },
  contact: {
    keywords: ['contact', 'reach', 'email', 'phone', 'meeting'],
    response: "I'd love to connect you with our team! Here are the ways to reach us:\n\n📧 **Email:** hello@cognivat.com\n📞 **Phone:** +1 (555) 123-4567\n📍 **Office:** 123 Innovation Drive, Tech City, TC 12345\n\nOr click the 'Get a Quote' button to schedule a free consultation!"
  },
  timeline: {
    keywords: ['timeline', 'duration', 'how long', 'delivery', 'time'],
    response: "Project timelines vary based on complexity:\n\n• **Simple AI Integration:** 2-4 weeks\n• **Custom Web Application:** 6-12 weeks\n• **Complex AI System:** 3-6 months\n• **Enterprise Solution:** 6-12 months\n\nWe always provide detailed timelines during our initial consultation."
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
          text: "👋 Hi! I'm AI Assistant from Cognivat. I'm here to help you learn about our AI and web development services.\n\nYou can ask me about:\n• Our services and capabilities\n• Pricing and project timelines\n• Technologies we use\n• Portfolio and case studies\n• How to get started\n\nWhat would you like to know?",
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
      return "Hello! I'm here to help you learn about Cognivat. What would you like to know about our AI and web development services?";
    }

    if (lowerInput.includes('help')) {
      return "I can help you with information about:\n\n• Our AI and web development services\n• Project pricing and timelines\n• Technologies and capabilities\n• Portfolio and case studies\n• Getting started with your project\n\nWhat specific area interests you most?";
    }

    if (lowerInput.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about our services? I'm here to help! 😊";
    }

    // Default response
    return "I'd be happy to help you with that! For detailed information about your specific needs, I recommend:\n\n• Checking our Services or Portfolio pages\n• Scheduling a free consultation with our team\n• Calling us at +1 (555) 123-4567\n\nIs there anything specific about our AI or web development services you'd like to know?";
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
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'rotate-45' : ''
        }`}
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
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm opacity-90">Cognivat</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/50'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.sender === 'user' ? 'text-white' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(question);
                      setTimeout(sendMessage, 100);
                    }}
                    className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-full px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors duration-200"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  inputText.trim() && !isTyping
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:shadow-lg'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
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