export interface NavLink {
  index?: string;
  /** Key within the `Nav` namespace. Resolved by the consuming component. */
  labelKey: string;
  href: string;
}

/**
 * STAGE-1 FALLBACK HREFS: pillar routes /services/ai-agents, /services/mobile-apps,
 * /services/agent-integration ship in stage 3. Until then, point at the closest
 * existing page so no nav link 404s. Stage 3 flips these to the real routes.
 */
export const SERVICE_LINKS: NavLink[] = [
  { index: '01', labelKey: 'aiAgents', href: '/services' },
  { index: '02', labelKey: 'webDevelopment', href: '/services/web-development' },
  { index: '03', labelKey: 'mobileApps', href: '/services/ios-development' },
  { index: '04', labelKey: 'agentIntegration', href: '/services' },
];

export const PRIMARY_LINKS: NavLink[] = [
  // "Work" and "Products" were the same thing (our built products ARE our work),
  // so they're merged into a single Products entry pointing at /products.
  { labelKey: 'products', href: '/products' },
  { labelKey: 'process', href: '/process' },
  { labelKey: 'resources', href: '/resources' },
  { labelKey: 'about', href: '/about' },
];
