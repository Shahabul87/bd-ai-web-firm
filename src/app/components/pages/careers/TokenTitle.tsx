'use client';

import { Fragment, useState, type CSSProperties } from 'react';
import { toBengaliDigits } from '@/app/lib/numerals';
import { titleText, type TitleWord } from './schema';

interface TokenTitleProps {
  id: string;
  words: TitleWord[];
  toggleLabel: string;
  caption: string;
  bengaliDigits: boolean;
}

const vars = (v: Record<string, number>) => v as unknown as CSSProperties;

/**
 * The Careers headline, tokenized. On load (CSS only) the words arrive as
 * separate token chips, hold for a beat, then close up into the sentence. The
 * "Show tokens" toggle splits them again and keeps them split, with each
 * token's position above it, so the effect is also something you can inspect.
 *
 * Screen readers get the sentence once (the chips are aria-hidden). Without
 * scripting or with reduced motion there is no entrance: the assembled
 * headline is the server HTML.
 */
export default function TokenTitle({ id, words, toggleLabel, caption, bengaliDigits }: TokenTitleProps) {
  const [split, setSplit] = useState(false);
  const [touched, setTouched] = useState(false);
  const count = words.reduce((n, w) => n + w.t.length, 0);
  let index = 0;

  return (
    <div className="ca-title" data-mode={split ? 'tokens' : 'text'} data-touched={touched ? '' : undefined}>
      <h1 id={id} className="pg-h1 ca-h1" style={vars({ '--mid': (count - 1) / 2 })}>
        <span className="sr-only">{titleText(words)}</span>
        <span className="ca-words" aria-hidden="true">
          {words.map((word, wi) => {
            const Tag = word.em ? 'em' : 'span';
            return (
              <Fragment key={wi}>
                <Tag className="ca-word">
                  {word.t.map((tok, ti) => {
                    const i = index++;
                    const n = String(i + 1);
                    return (
                      <span key={ti} className="ca-tok" data-n={bengaliDigits ? toBengaliDigits(n) : n} style={vars({ '--i': i })}>
                        {tok}
                      </span>
                    );
                  })}
                </Tag>
                {wi < words.length - 1 ? ' ' : null}
              </Fragment>
            );
          })}
        </span>
      </h1>
      <div className="ca-tokbar">
        <button
          type="button"
          className="ca-tokbtn"
          aria-pressed={split}
          onClick={() => {
            setTouched(true);
            setSplit((s) => !s);
          }}
        >
          <span className="ca-tokbtn-box" aria-hidden="true" />
          {toggleLabel}
        </button>
        <p className="pg-cap ca-tokcap" aria-live="polite">
          {split ? caption : ''}
        </p>
      </div>
    </div>
  );
}
