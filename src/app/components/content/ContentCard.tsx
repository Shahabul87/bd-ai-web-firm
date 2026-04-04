import Link from 'next/link';

interface ContentCardProps {
  title: string;
  excerpt: string;
  type: 'blog' | 'case-study' | 'guide';
  slug: string;
  date: string;
  readTime?: number;
  tags: string[];
}

const typeConfig: Record<
  ContentCardProps['type'],
  { label: string; color: string; bg: string; border: string; href: string }
> = {
  blog: {
    label: 'Blog',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    href: '/resources/blog',
  },
  'case-study': {
    label: 'Case Study',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    href: '/resources/case-studies',
  },
  guide: {
    label: 'Guide',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    href: '/resources/guides',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ContentCard({
  title,
  excerpt,
  type,
  slug,
  date,
  readTime,
  tags,
}: ContentCardProps) {
  const config = typeConfig[type];
  const href = `${config.href}/${slug}`;

  return (
    <Link href={href} className="group block h-full">
      <article
        className="relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-500/30 h-full flex flex-col"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Type badge */}
          <span
            className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${config.color} ${config.bg} ${config.border}`}
          >
            {config.label}
          </span>

          {/* Title */}
          <h3
            className="text-lg sm:text-xl font-bold mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors line-clamp-2"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h3>

          {/* Excerpt */}
          <p
            className="text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {excerpt}
          </p>

          {/* Date + Read Time */}
          <div
            className="flex items-center gap-3 text-xs mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            <time dateTime={date}>{formatDate(date)}</time>
            {readTime && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{readTime} min read</span>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs border"
                style={{
                  background: 'var(--surface-elevated)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
