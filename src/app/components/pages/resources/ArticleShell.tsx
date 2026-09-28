import type { CSSProperties, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import ArticleBody from './ArticleBody';
import ArticleToc from './ArticleToc';
import ReadingProgress from './ReadingProgress';
import { extractHeadings } from './headings';

export interface ArticleMetaItem {
  label: string;
  /** Set for a date: rendered as <time dateTime>. */
  dateTime?: string;
}

export interface ArticleShellProps {
  /** Id prefix for this article's headings and landmarks, e.g. "rs-post". */
  id: string;
  /** Small line above the title, e.g. "Blog" or "Guide". */
  kicker: string;
  back: { href: string; label: string };
  title: string;
  /** The standfirst under the title (the content's excerpt). */
  dek: string;
  /** Pre-formatted meta line: author, date, reading time… */
  meta: ArticleMetaItem[];
  /** Pre-formatted tag labels. */
  tags?: string[];
  /** Velite `s.mdx()` output. */
  code: string;
  /** `lang` of the content when it differs from the page (English MDX on /bn). */
  contentLang?: string;
  labels: {
    /** Heading/aria-label of the table of contents ("On this page"). */
    toc: string;
    /** aria-label of the tag list. */
    tags: string;
  };
  /** Localised section numbers for the TOC ("01", "02"…); defaults to ASCII. */
  numbers?: string[];
  /** Rendered in the reading column before the body (e.g. a results panel). */
  lead?: ReactNode;
  /** Rendered in the reading column after the body (e.g. <ArticleEnd>). */
  after?: ReactNode;
}

const d = (n: number) => ({ '--d': n }) as CSSProperties;

/**
 * The reading room's article layout, shared by blog posts and guides (and
 * available to case studies): a serif title with its standfirst and meta
 * line, a gold reading-progress line at the top of the viewport, a sticky
 * table of contents built from the MDX headings that tracks the section being
 * read, and the MDX body set at a ~68ch measure. Everything but the progress
 * line and the TOC highlight is server-rendered and readable without JS.
 * Styles: `.pg-resources .rs-article` in page-resources.css.
 */
export default function ArticleShell({
  id,
  kicker,
  back,
  title,
  dek,
  meta,
  tags = [],
  code,
  contentLang,
  labels,
  numbers,
  lead,
  after,
}: ArticleShellProps) {
  const headings = extractHeadings(code);
  const h2Count = headings.filter((h) => h.level === 2).length;
  const nums = numbers ?? Array.from({ length: h2Count }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <article className="rs-article" aria-labelledby={`${id}-h`}>
      <ReadingProgress targetId={`${id}-body`} />
      <header className="rs-a-hero">
        <div className="attn-wrap rs-a-head">
          <Link className="rs-back pg-enter" href={back.href}>
            <span aria-hidden="true">← </span>
            {back.label}
          </Link>
          <p className="pg-kicker pg-enter">{kicker}</p>
          <h1 id={`${id}-h`} className="rs-a-h1 pg-enter" style={d(1)} lang={contentLang}>
            {title}
          </h1>
          <p className="rs-a-dek pg-enter" style={d(2)} lang={contentLang}>
            {dek}
          </p>
          <div className="rs-a-meta pg-enter" style={d(3)}>
            <p className="rs-a-line">
              {meta.map((m, i) => (
                <span key={`${m.label}-${i}`}>
                  {m.dateTime ? <time dateTime={m.dateTime}>{m.label}</time> : m.label}
                </span>
              ))}
            </p>
            {tags.length > 0 ? (
              <ul className="rs-tags" aria-label={labels.tags}>
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </header>

      <div className="attn-wrap rs-a-grid">
        <aside className="rs-a-side">
          <ArticleToc headings={headings} label={labels.toc} numbers={nums} />
        </aside>
        <div className="rs-a-main" id={`${id}-body`}>
          {lead}
          <ArticleBody code={code} lang={contentLang} />
          {after}
        </div>
      </div>
    </article>
  );
}
