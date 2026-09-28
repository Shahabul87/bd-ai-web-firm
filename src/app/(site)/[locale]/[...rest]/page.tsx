import { notFound } from 'next/navigation';

/**
 * Any URL no route matches lands here inside the locale layout, so it gets the
 * localized "out of distribution" 404 (with header, footer and fonts) instead
 * of the root not-found, which has no root layout and breaks the dev server.
 */
export default function CatchAll() {
  notFound();
}
