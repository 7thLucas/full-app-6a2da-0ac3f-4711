import { Link } from "react-router";
import { Shield, AlertTriangle, Activity, Lock, Eye, Zap, ChevronRight, ArrowRight, Check } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

// ─── Nav ────────────────────────────────────────────────────────────────────

function Nav({ appName, logoUrl }: { appName: string; logoUrl: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && logoUrl !== "FILL_LOGO_URL_HERE" ? (
            <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-black text-white text-lg tracking-tight">{appName}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/#architecture" className="text-slate-400 hover:text-white text-sm transition-colors">Architecture</Link>
          <Link to="/#why-millions" className="text-slate-400 hover:text-white text-sm transition-colors">Why It Matters</Link>
          <Link to="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</Link>
          <Link to="/licensing" className="text-slate-400 hover:text-white text-sm transition-colors">Licensing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className="text-slate-400 hover:text-white text-sm transition-colors hidden md:block">Sign In</Link>
          <Link
            to="/demo"
            className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ headline, subheadline, ctaLabel, secondaryCTA }: {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  secondaryCTA: string;
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">
            World's First Multi-Model AI Governance System
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight text-white mb-6">
          {headline.split(".").map((part, i, arr) =>
            i === 0 ? (
              <span key={i}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
                  {part}
                </span>
                {i < arr.length - 1 && "."}
              </span>
            ) : (
              <span key={i}>
                {part}
                {i < arr.length - 1 && "."}
              </span>
            )
          )}
        </h1>

        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-10">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            {secondaryCTA}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 rounded-2xl overflow-hidden border border-slate-800">
          {[
            { value: "3", label: "AI Models Governed" },
            { value: "100%", label: "Audit Coverage" },
            { value: "6", label: "Threat Vectors Blocked" },
            { value: "< 50ms", label: "Governance Latency" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 px-6 py-5 text-center">
              <div className="text-3xl font-black text-cyan-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Architecture ────────────────────────────────────────────────────────────

function Architecture() {
  const layers = [
    {
      number: "01",
      name: "Offline Trinity",
      badge: "Layer 1",
      description:
        "Local AI models running on your own infrastructure. Handles reasoning, safety evaluation, and logic validation with zero internet dependency. Operates in air-gapped environments. The deterministic safety backbone.",
      features: ["Air-gapped operation", "Local model execution", "Deterministic safety rules", "No external API calls"],
      color: "emerald",
    },
    {
      number: "02",
      name: "Online Trinity",
      badge: "Layer 2",
      description:
        "Your provided API keys for Gemini, Claude, and ChatGPT. ISI Nexus orchestrates all three simultaneously, cross-checks outputs for contradictions, and surfaces disagreements in real time.",
      features: ["Gemini (Google)", "Claude (Anthropic)", "ChatGPT (OpenAI)", "Real-time cross-checking"],
      color: "cyan",
    },
    {
      number: "03",
      name: "ISI Governance Layer",
      badge: "Layer 3 — Independent Judge",
      description:
        "The authoritative layer above both trinities. Every AI output is evaluated for drift, hallucinations, unsafe actions, corruption, contradictions, and unauthorized commands. Every decision is logged, timestamped, and auditable.",
      features: ["AI Drift detection", "Hallucination filtering", "Unsafe action blocking", "Full audit log"],
      color: "amber",
    },
  ];

  const colorMap: Record<string, { border: string; badge: string; dot: string; check: string }> = {
    emerald: {
      border: "border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
      check: "text-emerald-400",
    },
    cyan: {
      border: "border-cyan-500/20",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      dot: "bg-cyan-400",
      check: "text-cyan-400",
    },
    amber: {
      border: "border-amber-500/20",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
      check: "text-amber-400",
    },
  };

  return (
    <section id="architecture" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Architecture</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 leading-tight">
            Three Layers of Absolute Control
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            ISI Nexus operates as a governance stack — each layer independent, each layer auditable, together forming the most defensible AI oversight system available.
          </p>
        </div>

        <div className="space-y-6">
          {layers.map((layer) => {
            const c = colorMap[layer.color];
            return (
              <div
                key={layer.number}
                className={`bg-slate-900 rounded-2xl border ${c.border} p-8 md:p-10`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  <div className="flex-shrink-0">
                    <span className="text-5xl font-black text-slate-800">{layer.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${c.badge}`}>
                        {layer.badge}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">{layer.name}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6 max-w-2xl">{layer.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {layer.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <Check className={`w-4 h-4 flex-shrink-0 ${c.check}`} />
                          <span className="text-sm text-slate-300">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Threat Vectors ───────────────────────────────────────────────────────────

function ThreatVectors() {
  const threats = [
    {
      icon: Activity,
      name: "AI Drift",
      desc: "Model behavior deviating from your approved baseline over time. ISI Nexus baselines every model at deployment and flags statistical divergence before it becomes a liability.",
      severity: "amber",
    },
    {
      icon: AlertTriangle,
      name: "Hallucinations",
      desc: "Fabricated or confidently wrong outputs that reach users or trigger downstream decisions. Cross-model verification surfaces single-model fabrications instantly.",
      severity: "red",
    },
    {
      icon: Shield,
      name: "Unsafe Actions",
      desc: "Outputs violating your defined safety constraints or authorization rules. The governance layer enforces policy — it doesn't just log violations.",
      severity: "red",
    },
    {
      icon: Lock,
      name: "System Corruption",
      desc: "Tampering with or unauthorized modification of model behavior or instructions. Integrity checks run continuously against your approved model configuration.",
      severity: "red",
    },
    {
      icon: Eye,
      name: "Multi-Model Contradictions",
      desc: "Disagreements between Gemini, Claude, and ChatGPT signal unreliable outputs. ISI surfaces these in real time before a bad answer reaches a decision-maker.",
      severity: "amber",
    },
    {
      icon: Zap,
      name: "Unauthorized Actions",
      desc: "Commands that exceed granted permissions — AI acting outside its authorized scope. Every action is permission-checked against your policy schema before execution.",
      severity: "amber",
    },
  ];

  const severityMap: Record<string, string> = {
    red: "border-red-500/30 bg-red-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
  };

  const iconColorMap: Record<string, string> = {
    red: "text-red-400",
    amber: "text-amber-400",
  };

  return (
    <section className="py-32 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Threat Coverage</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 leading-tight">
            Six Vectors. All Governed.
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            ISI Nexus is the only system that enforces governance against all six primary AI failure modes — simultaneously, in production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threats.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.name}
                className={`rounded-2xl border p-6 ${severityMap[t.severity]}`}
              >
                <Icon className={`w-6 h-6 mb-4 ${iconColorMap[t.severity]}`} />
                <h3 className="text-lg font-black text-white mb-2">{t.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Why It's Worth Millions ─────────────────────────────────────────────────

function WhyMillions() {
  const risks = [
    {
      scenario: "A hallucinating AI recommends a non-existent drug interaction to a clinical team.",
      cost: "$50M+ liability",
      prevented: "Hallucination detection blocks the output before delivery.",
    },
    {
      scenario: "An AI model silently drifts and begins approving fraudulent loan applications.",
      cost: "$20M+ fraud exposure",
      prevented: "Drift monitoring alerts within the first statistical deviation.",
    },
    {
      scenario: "A corrupted model instruction set leads to a data exfiltration incident.",
      cost: "Regulatory fines + breach costs",
      prevented: "Integrity checks detect instruction tampering in real time.",
    },
    {
      scenario: "Three AI vendors give contradictory answers to a regulatory compliance question.",
      cost: "Non-compliance risk",
      prevented: "Multi-model contradiction alerts surface the disagreement immediately.",
    },
  ];

  return (
    <section id="why-millions" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Enterprise Risk</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 leading-tight">
            Why This System Is Worth Millions
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            The question isn't whether your deployed AI will fail. The question is whether you'll know before the damage is done.
          </p>
        </div>

        <div className="space-y-4">
          {risks.map((r, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">Scenario</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{r.scenario}</p>
                </div>
                <div className="md:col-span-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Unmitigated Cost</div>
                  <p className="text-amber-400 font-black text-lg">{r.cost}</p>
                </div>
                <div className="md:col-span-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">ISI Nexus Response</div>
                  <p className="text-emerald-400 text-sm leading-relaxed">{r.prevented}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-slate-900 rounded-2xl border border-cyan-500/20 p-8 md:p-12 text-center">
          <h3 className="text-3xl font-black text-white mb-4">
            One prevented incident pays for years of ISI Nexus.
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Enterprise AI governance isn't a compliance checkbox. It's the control layer that makes AI deployment contractually defensible, regulatorily auditable, and operationally safe at scale.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Book a Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof / Differentiators ──────────────────────────────────────────

function Differentiators() {
  const items = [
    {
      title: "Governance, not just detection",
      desc: "ISI Nexus enforces policy. It doesn't alert you after the fact — it intercepts and blocks non-compliant outputs before they reach your systems or users.",
    },
    {
      title: "Model-agnostic by design",
      desc: "Works across Gemini, Claude, ChatGPT, and future models. Your governance layer is never vendor-locked.",
    },
    {
      title: "Offline-first safety",
      desc: "The Offline Trinity runs on your infrastructure. Safety enforcement continues even without internet access — critical for regulated industries.",
    },
    {
      title: "Auditable by design",
      desc: "Every governance decision is logged with a timestamp and rationale. Regulators, auditors, and legal teams get a complete, explainable record.",
    },
  ];

  return (
    <section className="py-32 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Competitive Differentiation</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 leading-tight">
            No Competitor Governs All Three Models. ISI Does.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.title} className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mb-4" />
              <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ footerText, appName }: { footerText: string; appName: string }) {
  return (
    <footer className="border-t border-slate-800 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white">{appName}</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-slate-400">
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/licensing" className="hover:text-white transition-colors">Licensing</Link>
          <Link to="/demo" className="hover:text-white transition-colors">Book a Demo</Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
        </div>
        <p className="text-xs text-slate-500">{footerText}</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IndexPage() {
  const { config, loading } = useConfigurables();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";
  const heroHeadline = config?.heroHeadline ?? "Govern Every AI Model. Defend Every Decision.";
  const heroSubheadline = config?.heroSubheadline ?? "The world's first multi-model AI governance and cybersecurity system.";
  const heroCTALabel = config?.heroCTALabel ?? "Book a Demo";
  const heroSecondaryCTA = config?.heroSecondaryCTALabel ?? "View Architecture";
  const footerText = config?.footerText ?? `© 2026 ${appName}. All rights reserved.`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />
      <Hero
        headline={heroHeadline}
        subheadline={heroSubheadline}
        ctaLabel={heroCTALabel}
        secondaryCTA={heroSecondaryCTA}
      />
      <Architecture />
      <ThreatVectors />
      <WhyMillions />
      <Differentiators />
      <Footer footerText={footerText} appName={appName} />
    </div>
  );
}
