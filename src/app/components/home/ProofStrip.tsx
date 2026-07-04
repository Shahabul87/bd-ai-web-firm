import MonoLabel from '../../design/ui/MonoLabel';

/* Slim, honest trust strip bridging the hero into the body. Real facts only —
   no invented client logos or numbers. */
const FACTS = [
  '4 products shipped',
  'web · ios · android',
  'human-reviewed code',
  'dhaka → worldwide',
];

export default function ProofStrip() {
  return (
    <section className="border-y border-line bg-ink-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <MonoLabel className="text-signal">● what we&apos;ve shipped</MonoLabel>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FACTS.map((fact) => (
            <li
              key={fact}
              className="font-mono text-xs uppercase tracking-[0.15em] text-steel"
            >
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
