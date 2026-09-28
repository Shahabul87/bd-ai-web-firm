import * as runtime from 'react/jsx-runtime';
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';

type MdxComponents = Record<string, ComponentType<Record<string, unknown>>>;

interface CalloutProps {
  /** note (gold), tip (mint) or warning (rose). */
  kind?: 'note' | 'tip' | 'warning';
  title?: string;
  children?: ReactNode;
}

/** `<Callout kind="tip" title="…">…</Callout>` inside MDX. */
function Callout({ kind = 'note', title, children }: CalloutProps) {
  return (
    <aside className={`rs-callout rs-callout-${kind}`}>
      {title ? <p className="rs-callout-t">{title}</p> : null}
      <div className="rs-callout-b">{children}</div>
    </aside>
  );
}

/** Wide tables scroll inside their own box instead of the page. */
function Table(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="rs-table" role="region" aria-label={props['aria-label']} tabIndex={0}>
      <table {...props} />
    </div>
  );
}

function Img({ alt = '', ...props }: ComponentPropsWithoutRef<'img'>) {
  // Content images are authored in MDX and may come from anywhere; next/image
  // would need their dimensions, so a plain lazy <img> is the honest choice.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} loading="lazy" decoding="async" {...props} />;
}

const COMPONENTS = { Callout, table: Table, img: Img } as unknown as MdxComponents;

interface ArticleBodyProps {
  /** Velite `s.mdx()` output. */
  code: string;
  lang?: string;
}

/**
 * Renders Velite-compiled MDX with the reading room's typography (`.rs-prose`).
 * The compiled function body is evaluated on the server only (these pages are
 * statically generated), same as the shared MdxContent.
 */
export default function ArticleBody({ code, lang }: ArticleBodyProps) {
  const fn = new Function(code);
  const Content = (fn({ ...runtime }) as { default: ComponentType<{ components?: MdxComponents }> }).default;
  return (
    <div className="rs-prose" lang={lang}>
      <Content components={COMPONENTS} />
    </div>
  );
}
