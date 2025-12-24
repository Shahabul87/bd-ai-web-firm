'use client';

import React, { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '17752506651'; // Format: country code + number without spaces or symbols
const DEFAULT_MESSAGE = 'Hi! I am interested in your AI development services. Can we discuss my project?';

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show tooltip after 3 seconds for first-time visitors
    const timer = setTimeout(() => {
      setShowTooltip(true);
      // Hide after 5 seconds
      setTimeout(() => setShowTooltip(false), 5000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <>
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed bottom-24 right-6 z-40 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg max-w-[200px] text-sm animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div className="relative">
            <span>Chat with us on WhatsApp!</span>
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full text-xs flex items-center justify-center hover:bg-gray-300"
              aria-label="Close tooltip"
            >
              &times;
            </button>
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          boxShadow: isHovered
            ? '0 8px 25px rgba(37, 211, 102, 0.5)'
            : '0 4px 15px rgba(37, 211, 102, 0.3)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowTooltip(false)}
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Pulse animation ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: '#25D366' }}
        />
      </a>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
