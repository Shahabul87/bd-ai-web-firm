import type { CSSProperties } from 'react';

/** Inline custom property for the shared `.pg-enter` / `.pg-rise` delay (`--d`). */
export const delay = (n: number): CSSProperties => ({ ['--d' as string]: n }) as CSSProperties;
