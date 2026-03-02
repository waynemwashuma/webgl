export interface NavTab {
  label: string;
  href?: string;
  children?: NavTab[];
}

export const sidebarTabs: NavTab[] = [
  {
    label: "Introduction",
    href: "#webgllis",
    children: [
      { label: "Top", href: "#webgllis" },
      { label: "Features", href: "#features" },
      { label: "Who This Is For", href: "#who-this-is-for" },
      { label: "Getting Started", href: "#getting-started" },
      { label: "Core Usage Flow", href: "#core-usage-flow" }
    ]
  },
  {
    label: "Examples",
    href: "/examples",
    children: [{ label: "Overview", href: "/examples" }]
  }
];
