export interface NavLink {
  /** Key within the `Nav` namespace. Resolved by the consuming component. */
  labelKey: string;
  href: string;
}

/**
 * The primary navigation, shared by the header, the mobile menu and the footer.
 * "Work" is the products page (our shipped products ARE our work) and
 * "Company" is the about page — the labels follow the home redesign, the
 * routes stay where they are.
 */
export const PRIMARY_LINKS: NavLink[] = [
  { labelKey: 'services', href: '/services' },
  { labelKey: 'work', href: '/products' },
  { labelKey: 'process', href: '/process' },
  { labelKey: 'company', href: '/about' },
];

/** Extra destinations listed in the footer only. */
export const FOOTER_LINKS: NavLink[] = [
  { labelKey: 'resources', href: '/resources' },
  { labelKey: 'contact', href: '/contact' },
];
