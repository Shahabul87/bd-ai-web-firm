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
        'prose prose-lg max-w-none dark:prose-invert',
        'prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl',
        'prose-p:leading-relaxed',
        'prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline',
        'prose-code:text-indigo-500 dark:prose-code:text-indigo-400',
        'prose-pre:border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--tw-prose-body': 'var(--text-secondary)',
          '--tw-prose-headings': 'var(--foreground)',
          '--tw-prose-bold': 'var(--foreground)',
          '--tw-prose-pre-bg': 'var(--surface-elevated)',
          '--tw-prose-pre-border': 'var(--border-default)',
        } as React.CSSProperties
      }
    >
      <Component />
    </div>
  );
}

function useMDXComponent(code: string) {
  const fn = new Function(code);
  const module = fn({ ...runtime });
  return module.default as React.ComponentType;
}
