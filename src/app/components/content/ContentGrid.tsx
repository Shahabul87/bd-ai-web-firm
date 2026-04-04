'use client';

import { useState, useMemo } from 'react';
import ContentCard from './ContentCard';
import { FilterBar } from '../ui';

interface ContentItem {
  title: string;
  excerpt: string;
  type: 'blog' | 'case-study' | 'guide';
  slug: string;
  date: string;
  readTime?: number;
  tags: string[];
}

interface ContentGridProps {
  items: ContentItem[];
  showFilter?: boolean;
}

export default function ContentGrid({
  items,
  showFilter = false,
}: ContentGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredItems = activeTag
    ? items.filter((item) => item.tags.includes(activeTag))
    : items;

  return (
    <div>
      {showFilter && allTags.length > 1 && (
        <div className="mb-8">
          <FilterBar
            tags={allTags}
            activeTag={activeTag}
            onTagSelect={setActiveTag}
          />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-secondary)' }}>
            No content found for this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <ContentCard
              key={`${item.type}-${item.slug}`}
              title={item.title}
              excerpt={item.excerpt}
              type={item.type}
              slug={item.slug}
              date={item.date}
              readTime={item.readTime}
              tags={item.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
