'use client';

import Tag from './Tag';

interface FilterBarProps {
  tags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  className?: string;
}

export default function FilterBar({
  tags,
  activeTag,
  onTagSelect,
  className = '',
}: FilterBarProps) {
  return (
    <div
      className={['flex flex-wrap items-center gap-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Tag
        active={activeTag === null}
        onClick={() => onTagSelect(null)}
      >
        All
      </Tag>
      {tags.map((tag) => (
        <Tag
          key={tag}
          active={activeTag === tag}
          onClick={() => onTagSelect(activeTag === tag ? null : tag)}
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
}
