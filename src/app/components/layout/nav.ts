export interface NavLink {
  index?: string;
  label: string;
  href: string;
}

/**
 * STAGE-1 FALLBACK HREFS: pillar routes /services/ai-agents, /services/mobile-apps,
 * /services/agent-integration ship in stage 3. Until then, point at the closest
 * existing page so no nav link 404s. Stage 3 flips these to the real routes.
 */
export const SERVICE_LINKS: NavLink[] = [
  { index: '01', label: 'AI Agents', href: '/services' },
  { index: '02', label: 'Web Development', href: '/services/web-development' },
  { index: '03', label: 'Mobile Apps', href: '/services/ios-development' },
  { index: '04', label: 'Agent Integration', href: '/services' },
];

export const PRIMARY_LINKS: NavLink[] = [
  // "Work" and "Products" were the same thing (our built products ARE our work),
  // so they're merged into a single Products entry pointing at /products.
  { label: 'Products', href: '/products' },
  { label: 'Process', href: '/process' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
];
