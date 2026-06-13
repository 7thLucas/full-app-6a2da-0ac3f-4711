import { Link, Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Shield, Check, ArrowRight, ClipboardList } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const modelName = String(fd.get("modelName") ?? "");
  const userPrompt = String(fd.get("userPrompt") ?? "");
  const aiOutput = String(fd.get("aiOutput") ?? "");
  const governancePolicy = String(fd.get("governancePolicy") ?? "");
  const notes = String(fd.get("notes") ?? "");

  if (!modelName || !userPrompt || !aiOutput) {
    return { error: "Model name, prompt, and AI output are required." };
  }

  try {
    // Submit to the judgment engine
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const formData = new FormData();
    formData.append(
      "inputData",
      JSON.stringify({ modelName, userPrompt, aiOutput, governancePolicy, notes })
    );

    const res = await fetch(`${baseUrl}/api/judgment/configs/isi_ai_governance_audit/submit`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      return { error: "Governance evaluation failed. Please try again." };
    }

    const data = await res.json() as any;
    return { success: true, result: data?.data ?? data };
  } catch (e) {
    return { error: "Submission failed. Ensure the governance audit config is active." };
  }
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
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
      </div>
    </nav>
  );
}

export default function GovernanceAuditPage() {
  const { config, loading } = useConfigurables();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";

  const result = actionData?.result;
  const verdictColors: Record<string, string> = {
    pass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    partial: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    fail: "text-red-400 bg-red-500/10 border-red-500/30",
    risk: "text-red-400 bg-red-500/10 border-red-500/30",
    ready: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    not_ready: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Governance Audit</span>
          <h1 className="text-4xl font-black text-white mt-2 leading-tight">
            Submit AI Output for Governance Review
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Submit an AI-generated output for automated compliance evaluation against the ISI Nexus governance criteria. The ISI Governance Layer will assess the output for hallucinations, safety violations, and policy compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              <h2 className="font-black text-white">Submit Evidence</h2>
            </div>

            {actionData?.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
                <p className="text-red-400 text-sm">{actionData.error}</p>
              </div>
            )}

            <Form method="post" className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  AI Model <span className="text-red-400">*</span>
                </label>
                <select
                  name="modelName"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select model</option>
                  <option value="Gemini">Gemini (Google)</option>
                  <option value="Claude">Claude (Anthropic)</option>
                  <option value="ChatGPT">ChatGPT (OpenAI)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  User Prompt <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="userPrompt"
                  required
                  rows={3}
                  placeholder="Paste the prompt sent to the AI model..."
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  AI Output <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="aiOutput"
                  required
                  rows={5}
                  placeholder="Paste the full AI model output..."
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Governance Policy Context
                </label>
                <input
                  name="governancePolicy"
                  type="text"
                  placeholder="e.g., Customer-facing responses must not include financial advice"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Reviewer Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Any additional context for the auditor..."
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit for Governance Audit
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </Form>
          </div>

          {/* Result */}
          <div>
            {result ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800">
                  <h3 className="font-black text-white">Governance Verdict</h3>
                  <p className="text-xs text-slate-500 mt-0.5">ISI Governance Layer assessment</p>
                </div>
                <div className="p-6 space-y-5">
                  {/* Verdict */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verdict</div>
                    <span className={`inline-block text-sm font-black px-3 py-1 rounded-full border uppercase ${verdictColors[result.verdict] ?? "text-slate-400 bg-slate-800"}`}>
                      {result.verdict}
                    </span>
                  </div>

                  {/* Score */}
                  {result.score !== undefined && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Compliance Score</div>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-black text-white">{result.score}</div>
                        <div className="flex-1 bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-cyan-500 rounded-full h-2 transition-all"
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-sm">/100</span>
                      </div>
                    </div>
                  )}

                  {/* Severity */}
                  {result.severity && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Severity</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${result.severity === "critical" || result.severity === "high" ? "bg-red-500/10 text-red-400" : result.severity === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {result.severity}
                      </span>
                    </div>
                  )}

                  {/* Reason */}
                  {result.reason && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assessment</div>
                      <p className="text-sm text-slate-300 leading-relaxed">{result.reason}</p>
                    </div>
                  )}

                  {/* Fix suggestion */}
                  {result.fixSuggestion && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recommendation</div>
                      <p className="text-sm text-cyan-300 leading-relaxed">{result.fixSuggestion}</p>
                    </div>
                  )}

                  {/* Human review flag */}
                  {result.requiresHumanReview && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-amber-400 text-sm font-semibold">Human Review Required</p>
                      <p className="text-amber-400/80 text-xs mt-1">This output requires manual review by a governance officer.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <Shield className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-400 text-sm">
                  Submit an AI output and the ISI Governance Layer will evaluate it for compliance, safety, and accuracy.
                </p>
                <div className="mt-6 space-y-2">
                  {["Hallucination detection", "Safety policy check", "Governance compliance score", "Audit-ready verdict"].map((f) => (
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
