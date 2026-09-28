'use client';

import { useState } from 'react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface SdFaqProps {
  items: FaqItem[];
  /** Prefix for element ids, unique on the page. */
  idBase: string;
}

/**
 * An accordion of real buttons (aria-expanded / aria-controls). The first
 * answer starts open. Panels animate their height with a grid-rows
 * transition; they are collapsed only when scripting is on, so without
 * JavaScript every answer is simply visible.
 */
export default function SdFaq({ items, idBase }: SdFaqProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(items.length ? [items[0].id] : []));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="sd-faq-list">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const btnId = `${idBase}-${item.id}-q`;
        const panelId = `${idBase}-${item.id}-a`;
        return (
          <div key={item.id} className={`sd-faq-item${isOpen ? ' is-open' : ''}`}>
            <h3>
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span>{item.question}</span>
                <i className="sd-faq-ico" aria-hidden="true" />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className="sd-faq-panel">
              <div>
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
