import { Link } from "react-router";
import { useState } from "react";
import { Shield, Check, ArrowRight } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

const defaultTiers = [
  {
    name: "Professional",
    price: "$2,500",
    annualPrice: "$25,000",
    description: "Up to 3 AI models, governance logging, drift detection, and 5 user seats.",
    highlighted: false,
    features: [
      "3 governed AI models",
      "Governance decisions log",
      "AI Drift detection",
      "Hallucination filtering",
      "5 user seats",
      "Email support",
      "90-day audit retention",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$8,500",
    annualPrice: "$85,000",
    description: "Unlimited models, full audit trail, multi-model contradiction detection, 25 seats, SLA.",
    highlighted: true,
    features: [
      "Unlimited AI models",
      "Full 6-vector threat coverage",
      "Multi-model contradiction alerts",
      "System corruption detection",
      "25 user seats",
      "Priority SLA (4hr response)",
      "Unlimited audit retention",
      "Custom governance policies",
      "Dedicated success engineer",
    ],
    cta: "Book a Demo",
  },
  {
    name: "White-Label",
    price: "Custom",
    annualPrice: "Custom",
    description: "Embed the ISI engine in your own product. Per-deployment licensing with full rebranding rights.",
    highlighted: false,
    features: [
      "Full ISI engine licensing",
      "White-label branding",
      "API-first integration",
      "Unlimited deployments",
      "Revenue share options",
      "Custom SLA",
      "Engineering onboarding",
      "Joint GTM support",
    ],
    cta: "Contact Sales",
  },
];

const perSeatAddOn = {
  label: "Per-Seat Add-on",
  description: "Expand any plan with additional users.",
  price: "$150/seat/month",
};

function Nav({ appName, logoUrl }: { appName: string; logoUrl: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {logoUrl && logoUrl !== "FILL_LOGO_URL_HERE" ? (
            <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-black text-white text-lg">{appName}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">Marketing</Link>
          <Link to="/demo" className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Book a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function PricingPage() {
  const { config, loading } = useConfigurables();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";
  const tiers = config?.pricingTiers && config.pricingTiers.length > 0 ? config.pricingTiers : defaultTiers;
  const footerText = config?.footerText ?? `© 2026 ${appName}. All rights reserved.`;

  const mergedTiers = defaultTiers.map((def, i) => {
    const t = tiers[i];
    return {
      ...def,
      name: t?.name ?? def.name,
      price: t?.price ?? def.price,
      annualPrice: t?.annualPrice ?? def.annualPrice,
      description: t?.description ?? def.description,
      highlighted: t?.highlighted ?? def.highlighted,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Pricing</span>
          <h1 className="text-5xl md:text-6xl font-black text-white mt-3 leading-none">
            Transparent, Scalable Pricing
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            Enterprise AI governance with a contractually defensible ROI from day one.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBilling("monthly")}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${billing === "monthly" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${billing === "annual" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Annual
              <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {mergedTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col relative ${
                tier.highlighted
                  ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-slate-900"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs font-black px-4 py-1 rounded-full tracking-widest uppercase">
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">
                    {billing === "annual" ? tier.annualPrice : tier.price}
                  </span>
                  {tier.price !== "Custom" && (
                    <span className="text-slate-400 text-sm">
                      /{billing === "annual" ? "year" : "month"}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{tier.description}</p>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                to={tier.name === "White-Label" ? "/demo" : "/demo"}
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  tier.highlighted
                    ? "bg-cyan-500 hover:bg-cyan-400 text-white"
                    : "border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Per-seat add-on */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 mb-16 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-black text-white text-lg mb-1">{perSeatAddOn.label}</h3>
            <p className="text-slate-400 text-sm">{perSeatAddOn.description}</p>
          </div>
          <div className="text-2xl font-black text-cyan-400">{perSeatAddOn.price}</div>
          <Link
            to="/demo"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            Get a Quote
          </Link>
        </div>

        {/* Enterprise contact */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-slate-900 rounded-2xl border border-cyan-500/20 p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Need a custom enterprise agreement?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Annual enterprise contracts with custom SLAs, dedicated infrastructure, custom governance policies, and legal defensibility guarantees are available.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Talk to Enterprise Sales
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        {footerText}
      </footer>
    </div>
  );
}
