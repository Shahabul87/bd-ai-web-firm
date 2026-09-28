import type { CSSProperties } from 'react';
import InView from '@/app/components/home/InView';
import IndexRow, { type IndexRowData } from './IndexRow';

interface EditorialListProps {
  rows: IndexRowData[];
  contentLang?: string;
  tagsLabel: string;
  as?: 'h2' | 'h3';
}

/** A static editorial index (the /resources shelves): rows rise in as they scroll into view. */
export default function EditorialList({ rows, contentLang, tagsLabel, as = 'h3' }: EditorialListProps) {
  return (
    <ol className="rs-index">
      {rows.map((row, i) => (
        <li key={row.key}>
          <InView once className="rs-rise-wrap">
            <div className="pg-rise" style={{ '--d': Math.min(i, 3) } as CSSProperties}>
              <IndexRow row={row} as={as} contentLang={contentLang} tagsLabel={tagsLabel} />
            </div>
          </InView>
        </li>
      ))}
    </ol>
  );
}
