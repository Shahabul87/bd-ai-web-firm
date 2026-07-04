import * as runtime from 'react/jsx-runtime';

interface MdxContentProps {
  code: string;
  className?: string;
}

/**
 * Renders Velite-compiled MDX content.
 *
 * Velite's `s.mdx()` outputs a function body string that expects
 * `{ Fragment, jsx, jsxs }` as `arguments[0]`. We evaluate it with
 * `new Function()` at build time (SSG / server components), so the
 * browser never executes `eval` and CSP is unaffected.
 */
export default function MdxContent({ code, className = '' }: MdxContentProps) {
  const Component = useMDXComponent(code);
  return (
    <div
      className={[
        'prose prose-invert prose-lg max-w-none',
        'prose-headings:font-display prose-headings:font-medium',
        'prose-h2:text-2xl prose-h3:text-xl',
        'prose-p:leading-relaxed',
        'prose-a:text-signal prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-bone',
        'prose-code:font-mono prose-code:text-signal prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:border prose-pre:border-line prose-pre:font-mono',
        'prose-blockquote:border-l-line prose-blockquote:text-steel',
        'prose-hr:border-line',
        'prose-li:marker:text-steel',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--tw-prose-body': 'var(--steel)',
          '--tw-prose-headings': 'var(--bone)',
          '--tw-prose-bold': 'var(--bone)',
          '--tw-prose-bullets': 'var(--steel)',
          '--tw-prose-counters': 'var(--steel)',
          '--tw-prose-pre-bg': 'var(--ink-900)',
          '--tw-prose-pre-code': 'var(--bone)',
        } as React.CSSProperties
      }
    >
      <Component />
    </div>
  );
}

function useMDXComponent(code: string) {
  const fn = new Function(code);
  const mdxModule = fn({ ...runtime });
  return mdxModule.default as React.ComponentType;
}
