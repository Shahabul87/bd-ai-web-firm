interface TokenBandProps {
  /** Phrases whose words stream past; each word becomes one token. */
  phrases: string[];
}

/** A faint strip of tokens drifting under the hero — texture, not content. */
export default function TokenBand({ phrases }: TokenBandProps) {
  const words = phrases.flatMap((p) => p.split(/\s+/)).filter(Boolean);
  // Rendered twice so the -50% loop is seamless.
  const stream = [...words, ...words];
  return (
    <div className="attn-band" aria-hidden="true">
      <div className="attn-band-track">
        {stream.map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}
