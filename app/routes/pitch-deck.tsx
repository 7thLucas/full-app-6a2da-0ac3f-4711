import { Link } from "react-router";
import { useState } from "react";
import { Shield, Download, RefreshCw, ChevronRight, ArrowRight } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { invokeLLM } from "@qb/agentic";

interface PitchSlide {
  title: string;
  headline: string;
  bullets: string[];
  note?: string;
}

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
          <Link to="/executive-summary" className="text-slate-400 hover:text-white text-sm transition-colors">
            Executive Summary
          </Link>
          <Link to="/demo" className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Book a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

const defaultSlides: PitchSlide[] = [
  {
    title: "Cover",
    headline: "ISI Nexus",
    bullets: [
      "The world's first multi-model AI governance and cybersecurity system",
      "Govern Gemini, Claude, and ChatGPT — simultaneously",
      "Every AI output verified, logged, and auditable",
    ],
    note: "Enterprise AI Governance Infrastructure",
  },
  {
    title: "The Problem",
    headline: "Your AI Is Deployed. Is It Governed?",
    bullets: [
      "68% of enterprises have no real-time AI output monitoring",
      "AI hallucinations cause $4.5B+ in documented corporate losses annually",
      "Regulatory frameworks now require AI audit trails — and penalties are live",
      "No single product governs multiple AI models simultaneously",
    ],
  },
  {
    title: "The Solution",
    headline: "Three Layers of Absolute Control",
    bullets: [
      "Layer 1: Offline Trinity — Local models, air-gapped safety, zero internet dependency",
      "Layer 2: Online Trinity — Gemini + Claude + ChatGPT orchestrated in parallel",
      "Layer 3: ISI Governance Layer — Independent judge, logs every decision",
      "Result: The only system that enforces AI policy, not just monitors it",
    ],
  },
  {
    title: "Six Threat Vectors",
    headline: "The Only Platform That Covers All Six",
    bullets: [
      "AI Drift — baseline deviation detected statistically before it compounds",
      "Hallucinations — cross-model consensus filters single-model fabrications",
      "Unsafe Actions — policy enforcement blocks non-compliant outputs at execution",
      "System Corruption — integrity checks run continuously on model configurations",
      "Multi-Model Contradictions — real-time disagreement alerts for unreliable outputs",
      "Unauthorized Actions — permission-scoped command validation at every step",
    ],
  },
  {
    title: "Market Opportunity",
    headline: "$47B AI Governance Market by 2028",
    bullets: [
      "Every enterprise deploying AI is a governance liability until they govern it",
      "Regulatory mandates (EU AI Act, SEC AI disclosure rules) create compliance urgency",
      "No incumbent owns the multi-model governance space — ISI Nexus is first",
      "Target: 500 enterprise deployments in 24 months",
    ],
  },
  {
    title: "Revenue Model",
    headline: "Five Revenue Streams, All Recurring",
    bullets: [
      "Subscriptions: $2,500–$8,500/month per enterprise",
      "Per-Seat Add-ons: $150/seat/month",
      "Enterprise Contracts: Custom annual agreements",
      "Licensing: Per-deployment fee for embedding the ISI engine",
      "White-Label: ISI engine under buyer's own brand",
    ],
  },
  {
    title: "Why Now",
    headline: "The Regulatory and Risk Window Is Open",
    bullets: [
      "EU AI Act enforcement begins in 2025 — audit requirements are live",
      "Every CIO/CISO who deployed AI in 2023–2024 is now exposed",
      "First-mover advantage in multi-model governance is a durable moat",
      "ISI Nexus is the only contractually defensible AI governance solution",
    ],
  },
  {
    title: "Call to Action",
    headline: "Deploy Governance Before the Next Incident",
    bullets: [
      "One prevented hallucination incident pays for years of ISI Nexus",
      "Free 30-day pilot for qualified enterprise accounts",
      "White-label licensing available for AI integrators",
      "Book a demo: isinexus.com/demo",
    ],
    note: "contact@isinexus.com",
  },
];

function SlideCard({ slide, index, total }: { slide: PitchSlide; index: number; total: number }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="bg-slate-950 px-6 py-3 flex items-center justify-between border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">{slide.title}</span>
        <span className="text-xs text-slate-600">
          {index + 1} / {total}
        </span>
      </div>
      <div className="p-8">
        <h2 className="text-2xl font-black text-white mb-6 leading-tight">{slide.headline}</h2>
        <ul className="space-y-3">
          {slide.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300 text-sm leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
        {slide.note && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="text-xs text-slate-500">{slide.note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PitchDeckPage() {
  const { config, loading } = useConfigurables();
  const [slides, setSlides] = useState<PitchSlide[]>(defaultSlides);
  const [generating, setGenerating] = useState(false);
  const [prospectContext, setProspectContext] = useState("");
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";

  async function generateCustomDeck() {
    if (!prospectContext.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const llmResult = await invokeLLM({
        message: `Generate a customized pitch deck for ISI Nexus tailored to this prospect context: "${prospectContext}". Return exactly 8 slides as a JSON array where each slide has: title (string), headline (string), bullets (string[] of 3-6 items), and optional note (string).`,
        schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  headline: { type: "string" },
                  bullets: { type: "array", items: { type: "string" } },
                  note: { type: "string" },
                },
                required: ["title", "headline", "bullets"],
              },
            },
          },
          required: ["slides"],
        },
        systemPrompt:
          "You are an enterprise sales expert for ISI Nexus, a multi-model AI governance cybersecurity platform. Create compelling pitch deck slides that speak to C-suite executives. Focus on risk, ROI, and regulatory compliance. Keep language authoritative and precise.",
      });
      const result = llmResult?.response as { slides?: PitchSlide[] } | null;
      if (result?.slides && Array.isArray(result.slides)) {
        setSlides(result.slides);
      }
    } catch (e: any) {
      setError("Unable to generate a custom deck at this time. Showing the default pitch deck.");
      setSlides(defaultSlides);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Pitch Deck Generator</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-3 leading-tight">
            Enterprise Sales Deck
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            A pre-built pitch deck for enterprise sales. Customize it for a specific prospect using AI — or use the default deck for any enterprise audience.
          </p>
        </div>

        {/* Custom generator */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-10">
          <h2 className="font-black text-white mb-3">Customize for a Prospect</h2>
          <p className="text-slate-400 text-sm mb-4">
            Enter context about the prospect (industry, AI tools, pain points) and get a tailored deck generated automatically.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={prospectContext}
              onChange={(e) => setProspectContext(e.target.value)}
              placeholder="e.g., Healthcare company using ChatGPT for clinical documentation, concerned about HIPAA compliance and hallucinations"
              className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={generateCustomDeck}
              disabled={generating || !prospectContext.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
            <button
              onClick={() => setSlides(defaultSlides)}
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-3 rounded-xl transition-colors text-sm"
            >
              Reset
            </button>
          </div>
          {error && <p className="text-amber-400 text-xs mt-3">{error}</p>}
        </div>

        {/* Slides grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map((slide, i) => (
            <SlideCard key={i} slide={slide} index={i} total={slides.length} />
          ))}
        </div>

        {/* Export note */}
        <div className="mt-10 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center gap-4">
          <Download className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-300 font-semibold">Export to your presentation tool</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy each slide's content into PowerPoint, Google Slides, or Keynote. The structure maps directly to a standard enterprise pitch format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
