export type NavItem = {
  label: string;
  href: string;
  submenu?: boolean;
  submenuItems?: { label: string; href: string }[];
};

export type SiteConfig = {
  name: string;
  serial: string;
  description: string;
  origin: string;
  navItems: NavItem[];
  navMenuItems: NavItem[];
  links: Record<string, string>;
};

export const siteConfig: SiteConfig = {
  name: "Construct Carnival",
  serial: "1.0",
  description:
    "Construct Carnival 1.0 is a nationwide festival for students studying Civil Engineering, Building Engineering and Construction Management, Urban and Regional Planning, and Architecture.",
  origin: "https://constructcarnival.com",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Workshop",
      href: "/workshop",
    },
    {
      label: "Events",
      href: "/events",
    },
    {
      label: "Registration",
      href: "/registration",
    },
    {
      label: "Schedule",
      href: "/important_dates",
    },
    {
      label: "Sponsors",
      href: "/sponsors",
    },
    {
      label: "Archive",
      href: "/archive",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Workshop",
      href: "/workshop",
    },
    {
      label: "Events",
      href: "/events",
    },
    {
      label: "Registration",
      href: "/registration",
    },
    {
      label: "Schedule",
      href: "/important_dates",
    },
    {
      label: "Sponsors",
      href: "/sponsors",
    },
    {
      label: "Archive",
      href: "/archive",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};