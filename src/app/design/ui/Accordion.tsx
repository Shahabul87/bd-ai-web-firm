'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/** FAQ accordion: one panel open at a time, mono +/− indicator. */
export default function Accordion({ items, className = '' }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`accordion-panel-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors duration-150 hover:text-signal"
            >
              <span className="text-sm font-medium text-bone">{item.question}</span>
              <span aria-hidden className="font-mono text-signal">
                {open ? '−' : '+'}
              </span>
            </button>
            {open ? (
              <div
                id={`accordion-panel-${item.id}`}
                className="pb-5 text-sm leading-relaxed text-steel"
              >
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
