import { Link } from "react-router";
import { useState } from "react";
import { Shield, RefreshCw, ArrowRight, FileText, Check } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { invokeLLM } from "@qb/agentic";

interface ExecutiveSummary {
  companyName: string;
  date: string;
  header: string;
  executiveSummary: string;
  riskContext: string;
  solution: string;
  financialImpact: string;
  recommendedAction: string;
  contactInfo: string;
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
        <Link to="/pitch-deck" className="text-slate-400 hover:text-white text-sm transition-colors">
          Pitch Deck
        </Link>
      </div>
    </nav>
  );
}

const defaultSummary: ExecutiveSummary = {
  companyName: "Your Company",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  header: "AI Governance Risk Assessment & Mitigation Proposal",
  executiveSummary:
    "Your organization has deployed large language models across critical operations. Without a governance layer, every AI output represents an unmanaged liability. ISI Nexus provides the world's first multi-model AI governance system — enforcing policy across Gemini, Claude, and ChatGPT simultaneously, with a complete auditable record of every AI decision.",
  riskContext:
    "Enterprises deploying AI without governance face three converging risks: (1) regulatory non-compliance under the EU AI Act and SEC AI disclosure rules; (2) operational risk from hallucinations, drift, and unauthorized AI actions in production; (3) reputational and legal exposure when AI outputs cause harm that could not be demonstrated as governed.",
  solution:
    "ISI Nexus installs a three-layer governance architecture above your existing AI deployments. The Offline Trinity provides deterministic safety without internet dependency. The Online Trinity orchestrates your current AI models in parallel, cross-checking outputs. The ISI Governance Layer acts as an independent judge — blocking unsafe outputs, detecting drift, logging every decision.",
  financialImpact:
    "A single undetected AI hallucination in a regulated decision (clinical, financial, legal) can exceed $10M in liability. AI drift that goes undetected for 30 days in a customer-facing deployment compounds to statistically significant adverse outcomes. ISI Nexus at $8,500/month represents a fraction of one prevented incident's cost.",
  recommendedAction:
    "We recommend a 30-day pilot deployment of ISI Nexus across your primary AI use case. We will baseline your current model behavior, deploy governance monitoring, and deliver a quantified risk reduction report at the end of the pilot period.",
  contactInfo: "contact@isinexus.com | isinexus.com",
};

function SummarySection({ label, content }: { label: string; content: string }) {
  return (
    <div className="border-b border-slate-800 pb-6 last:border-0 last:pb-0">
      <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">{label}</div>
      <p className="text-slate-300 text-sm leading-relaxed">{content}</p>
    </div>
  );
}

export default function ExecutiveSummaryPage() {
  const { config, loading } = useConfigurables();
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    aiTools: "",
    employeeCount: "",
    primaryUseCase: "",
    primaryConcern: "",
    regulatoryContext: "",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";

  async function generateSummary() {
    if (!form.companyName) return;
    setGenerating(true);
    setError("");
    try {
      const llmResult = await invokeLLM({
        message: `Generate a one-page executive summary for C-suite evaluation of ISI Nexus for this company:
Company: ${form.companyName}
Industry: ${form.industry}
AI Tools in Use: ${form.aiTools}
Employee Count: ${form.employeeCount}
Primary AI Use Case: ${form.primaryUseCase}
Primary Governance Concern: ${form.primaryConcern}
Regulatory Context: ${form.regulatoryContext}

Return a JSON object with these exact fields: companyName, date, header, executiveSummary, riskContext, solution, financialImpact, recommendedAction, contactInfo.`,
        schema: {
          type: "object",
          properties: {
            companyName: { type: "string" },
            date: { type: "string" },
            header: { type: "string" },
            executiveSummary: { type: "string" },
            riskContext: { type: "string" },
            solution: { type: "string" },
            financialImpact: { type: "string" },
            recommendedAction: { type: "string" },
            contactInfo: { type: "string" },
          },
          required: ["companyName", "date", "header", "executiveSummary", "riskContext", "solution", "financialImpact", "recommendedAction", "contactInfo"],
        },
        systemPrompt:
          "You are an enterprise sales strategist for ISI Nexus. Generate a precise, authoritative one-page executive summary for C-suite buyers. Speak to risk, financial impact, and regulatory defensibility. Use specific numbers and industry context. Avoid hype. Be direct and credible.",
      });
      const result = llmResult?.response as ExecutiveSummary | null;
      if (result?.companyName) {
        setSummary(result);
      } else {
        throw new Error("Invalid response");
      }
    } catch (e: any) {
      setError("Unable to generate at this time. Showing default summary.");
      setSummary({ ...defaultSummary, companyName: form.companyName || defaultSummary.companyName });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Generator</span>
            <h1 className="text-4xl font-black text-white mt-3 mb-4 leading-tight">
              Buyer Executive Summary
            </h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Generate a one-page C-suite evaluation document for any prospect. Auto-populated with ISI Nexus value propositions tailored to their industry and AI context.
            </p>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
              {[
                { name: "companyName", label: "Company Name", placeholder: "Acme Financial Group", required: true },
                { name: "industry", label: "Industry", placeholder: "e.g., Healthcare, Financial Services, Legal" },
                { name: "aiTools", label: "AI Tools in Use", placeholder: "e.g., ChatGPT, Claude, Gemini" },
                { name: "employeeCount", label: "Employee Count", placeholder: "e.g., 2,500" },
                { name: "primaryUseCase", label: "Primary AI Use Case", placeholder: "e.g., Customer service automation, contract review" },
                { name: "primaryConcern", label: "Primary Governance Concern", placeholder: "e.g., Hallucinations in regulated outputs" },
                { name: "regulatoryContext", label: "Regulatory Context", placeholder: "e.g., HIPAA, SOX, EU AI Act" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={(form as any)[field.name]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              ))}

              {error && (
                <p className="text-amber-400 text-xs">{error}</p>
              )}

              <button
                onClick={generateSummary}
                disabled={generating || !form.companyName}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Executive Summary
                  </>
                )}
              </button>

              <button
                onClick={() => setSummary(defaultSummary)}
                className="w-full border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white py-3 rounded-xl transition-colors text-sm"
              >
                View Default Template
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div>
            {summary ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                {/* Document header */}
                <div className="bg-slate-950 px-8 py-6 border-b border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-black text-white">{appName}</span>
                  </div>
                  <h2 className="text-xl font-black text-white leading-tight">{summary.header}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-slate-400">
                      Prepared for: <span className="text-white font-semibold">{summary.companyName}</span>
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-sm text-slate-400">{summary.date}</span>
                  </div>
                </div>

                {/* Sections */}
                <div className="px-8 py-6 space-y-6">
                  <SummarySection label="Executive Summary" content={summary.executiveSummary} />
                  <SummarySection label="Risk Context" content={summary.riskContext} />
                  <SummarySection label="Proposed Solution" content={summary.solution} />
                  <SummarySection label="Financial Impact" content={summary.financialImpact} />
                  <SummarySection label="Recommended Action" content={summary.recommendedAction} />
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{summary.contactInfo}</span>
                  <Link
                    to="/demo"
                    className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Book Demo
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center h-96">
                <FileText className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-400 text-sm">
                  Fill in the form and generate a customized executive summary for your prospect.
                </p>
                <div className="mt-6 space-y-2">
                  {["Tailored risk framing", "Industry-specific ROI", "Regulatory context", "C-suite language"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
