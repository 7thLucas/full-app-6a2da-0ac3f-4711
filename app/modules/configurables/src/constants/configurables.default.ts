/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TPricingTier = {
  name: string;
  price: string;
  annualPrice?: string;
  description?: string;
  highlighted?: boolean;
};

export type TSocialLinks = {
  linkedin?: string;
  twitter?: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline?: string;
  logoUrl: string;
  brandColor: TBrandColor;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCTALabel?: string;
  heroSecondaryCTALabel?: string;
  contactEmail?: string;
  showPricingPage?: boolean;
  showDashboard?: boolean;
  pricingTiers?: TPricingTier[];
  footerText?: string;
  socialLinks?: TSocialLinks;
  adminEmail?: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "ISI Nexus",
  tagline: "The world's first multi-model AI governance and cybersecurity system.",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#06b6d4",
    secondary: "#0f172a",
    accent: "#22d3ee",
  },
  heroHeadline: "Govern Every AI Model. Defend Every Decision.",
  heroSubheadline:
    "ISI Nexus is the world's first multi-model AI governance and cybersecurity system. Protect your enterprise from AI drift, hallucinations, and unauthorized actions — across Gemini, Claude, and ChatGPT simultaneously.",
  heroCTALabel: "Book a Demo",
  heroSecondaryCTALabel: "View Architecture",
  contactEmail: "contact@isinexus.com",
  showPricingPage: true,
  showDashboard: true,
  pricingTiers: [
    {
      name: "Professional",
      price: "$2,500",
      annualPrice: "$25,000",
      description: "Up to 3 AI models, governance logging, drift detection, and 5 user seats.",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "$8,500",
      annualPrice: "$85,000",
      description: "Unlimited models, full audit trail, multi-model contradiction detection, 25 seats, SLA.",
      highlighted: true,
    },
    {
      name: "White-Label",
      price: "Custom",
      annualPrice: "Custom",
      description: "Embed the ISI engine in your own product. Per-deployment licensing with full rebranding rights.",
      highlighted: false,
    },
  ],
  footerText: "© 2026 ISI Nexus. All rights reserved. AI governance infrastructure for the enterprise.",
  socialLinks: {
    linkedin: "",
    twitter: "",
  },
  adminEmail: "admin@isinexus.com",
};
