interface StepperProps {
  steps: string[];
  /** 0-indexed active step */
  current: number;
  className?: string;
}

/** Mono progress stepper for multi-step flows (quote estimator). */
export default function Stepper({ steps, current, className = '' }: StepperProps) {
  return (
    <div className={className}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
        Step {Math.min(current + 1, steps.length)}/{steps.length}
      </p>
      <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {steps.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo';
          return (
            <li
              key={step}
              aria-current={state === 'active' ? 'step' : undefined}
              className={`font-mono text-xs uppercase tracking-[0.15em] ${
                state === 'active'
                  ? 'text-signal'
                  : state === 'done'
                    ? 'text-bone'
                    : 'text-steel'
              }`}
            >
              {state === 'done' ? '✓ ' : `${String(i + 1).padStart(2, '0')} `}
              {step}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
