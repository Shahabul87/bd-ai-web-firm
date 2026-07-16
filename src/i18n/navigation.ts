import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware replacements for next/link and next/navigation.
// Using these instead of the next/* originals is what keeps the toggle on
// the current page instead of dumping the user on the homepage.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
