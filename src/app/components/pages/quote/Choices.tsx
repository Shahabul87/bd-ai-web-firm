'use client';

import type { ReactNode } from 'react';

interface ChoiceGroupProps {
  /** Form field name (also the id prefix). */
  name: string;
  legend: string;
  hint?: ReactNode;
  options: ReadonlyArray<{ slug: string; label: string }>;
  /** Checkboxes when true, radios otherwise. */
  multiple?: boolean;
  selected: readonly string[];
  onPick: (slug: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * A row of chips backed by real checkboxes / radios laid invisibly over each
 * chip, so clicks, Space, arrow keys (radios) and form semantics are native.
 * The error line is tied to the fieldset with aria-describedby.
 */
export default function ChoiceGroup({
  name,
  legend,
  hint,
  options,
  multiple = false,
  selected,
  onPick,
  error,
  disabled,
}: ChoiceGroupProps) {
  const hintId = hint ? `qt-${name}-hint` : undefined;
  const errId = error ? `qt-${name}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset
      className="qt-group"
      data-field={name}
      aria-describedby={describedBy}
      data-invalid={error ? '' : undefined}
      disabled={disabled}
    >
      <legend className="qt-cap">{legend}</legend>
      {hint ? (
        <p id={hintId} className="qt-hint">
          {hint}
        </p>
      ) : null}
      <div className="qt-chips" data-kind={multiple ? 'multi' : 'one'}>
        {options.map(({ slug, label }) => {
          const on = selected.includes(slug);
          return (
            <label key={slug} className="qt-chip" data-on={on ? '' : undefined}>
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={slug}
                checked={on}
                onChange={() => onPick(slug)}
              />
              <span className="qt-chip-mark" aria-hidden="true" />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errId} className="qt-ferr">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
