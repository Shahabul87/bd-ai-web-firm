'use client';

import { useState } from 'react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className = '' }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className={[
        'divide-y divide-[var(--border-default)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index}>
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left text-[var(--foreground)] transition-colors duration-200 hover:text-indigo-400"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
            >
              <span className="pr-4 font-medium">{item.question}</span>
              <svg
                className={[
                  'h-5 w-5 shrink-0 text-[var(--text-secondary)] transition-transform duration-300',
                  isOpen ? 'rotate-180' : '',
                ].join(' ')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={[
                'overflow-hidden transition-all duration-300 ease-in-out',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
              ].join(' ')}
            >
              <p className="pb-4 text-[var(--text-secondary)] leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
