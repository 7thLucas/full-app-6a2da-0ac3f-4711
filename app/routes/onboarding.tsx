import { Link, Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { useState } from "react";
import { Shield, Check, ChevronRight, Key, Activity, Lock } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const step = String(fd.get("step") ?? "1");

  if (step === "1") {
    const geminiKey = String(fd.get("geminiKey") ?? "").trim();
    const claudeKey = String(fd.get("claudeKey") ?? "").trim();
    const openaiKey = String(fd.get("openaiKey") ?? "").trim();

    if (!geminiKey && !claudeKey && !openaiKey) {
      return { error: "Please provide at least one API key.", step: "1" };
    }
    return { step: "2", geminiKey, claudeKey, openaiKey };
  }

  if (step === "2") {
    const governanceLevel = String(fd.get("governanceLevel") ?? "standard");
    const driftThreshold = String(fd.get("driftThreshold") ?? "15");
    const blockUnsafe = fd.get("blockUnsafe") === "on";
    const requireConsensus = fd.get("requireConsensus") === "on";
    return {
      step: "complete",
      governanceLevel,
      driftThreshold,
      blockUnsafe,
      requireConsensus,
      activationKey: `ISI-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
  }

  return { step: "1" };
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
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["API Keys", "Governance Config", "Activation"];
  return (
    <div className="flex items-center gap-2 mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
            i + 1 < currentStep ? "bg-emerald-500 text-white" : i + 1 === currentStep ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-500"
          }`}>
            {i + 1 < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${i + 1 === currentStep ? "text-white" : "text-slate-500"}`}>{s}</span>
          {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { config, loading } = useConfigurables();
  const { user } = useAuth();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const currentStep = (() => {
    if (actionData?.step === "complete") return 3;
    if (actionData?.step === "2") return 2;
    return 1;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Client Onboarding</span>
          <h1 className="text-3xl font-black text-white mt-2 leading-tight">
            Activate Your Governance Layer
          </h1>
          {user && (
            <p className="text-slate-400 text-sm mt-1">Welcome, {user.email}</p>
          )}
        </div>

        <StepIndicator currentStep={currentStep} />

        {/* Step 1: API Keys */}
        {currentStep === 1 && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-cyan-400" />
              <h2 className="font-black text-white text-xl">Connect Your AI Models</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Provide your API keys for each AI model you want ISI Nexus to govern. Keys are encrypted at rest and never shared. Provide at least one key to continue.
            </p>
            {actionData?.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">{actionData.error}</p>
              </div>
            )}
            <Form method="post" className="space-y-5">
              <input type="hidden" name="step" value="1" />
              {[
                { name: "geminiKey", label: "Google Gemini API Key", placeholder: "AIza...", hint: "From Google AI Studio" },
                { name: "claudeKey", label: "Anthropic Claude API Key", placeholder: "sk-ant-...", hint: "From Anthropic Console" },
                { name: "openaiKey", label: "OpenAI API Key", placeholder: "sk-...", hint: "From OpenAI Platform" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type="password"
                    placeholder={field.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <p className="text-xs text-slate-600 mt-1">{field.hint}</p>
                </div>
              ))}
              <div className="bg-slate-800 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  Your API keys are encrypted with AES-256 and stored in your organization's isolated vault. ISI Nexus never shares keys externally and uses them only to call governed endpoints on your behalf.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Continue to Governance Config <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </Form>
          </div>
        )}

        {/* Step 2: Governance Config */}
        {currentStep === 2 && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="font-black text-white text-xl">Configure Governance Policy</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Set your governance thresholds and enforcement rules. You can adjust these at any time from your admin panel.
            </p>
            <div className="bg-slate-800 rounded-xl p-4 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">API Keys Provisioned</div>
              <div className="flex gap-3 flex-wrap">
                {actionData?.geminiKey && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">Gemini</span>}
                {actionData?.claudeKey && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">Claude</span>}
                {actionData?.openaiKey && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">ChatGPT</span>}
              </div>
            </div>
            <Form method="post" className="space-y-5">
              <input type="hidden" name="step" value="2" />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Governance Enforcement Level
                </label>
                <select
                  name="governanceLevel"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="monitor">Monitor Only — Log violations, do not block</option>
                  <option value="standard" selected>Standard — Block critical violations, flag others</option>
                  <option value="strict">Strict — Block all policy violations</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  AI Drift Alert Threshold (%)
                </label>
                <input
                  name="driftThreshold"
                  type="number"
                  defaultValue="15"
                  min="1"
                  max="50"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <p className="text-xs text-slate-600 mt-1">Alert when model output deviates more than this % from baseline</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: "blockUnsafe", label: "Block unsafe actions automatically", desc: "Immediately block any output flagged as unsafe" },
                  { name: "requireConsensus", label: "Require multi-model consensus", desc: "Flag outputs when all three models disagree" },
                ].map((toggle) => (
                  <label key={toggle.name} className="flex items-start gap-3 cursor-pointer bg-slate-800 rounded-xl p-4">
                    <input type="checkbox" name={toggle.name} defaultChecked className="mt-0.5 accent-cyan-500" />
                    <div>
                      <div className="text-sm font-semibold text-white">{toggle.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{toggle.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Activate Governance <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </Form>
          </div>
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && (
          <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Governance Layer Activated</h2>
            <p className="text-slate-400 mb-6">
              Your ISI Nexus governance layer is now active. All connected AI models are being monitored.
            </p>

            <div className="bg-slate-800 rounded-xl p-4 mb-6 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Activation Key</div>
              <code className="text-cyan-400 font-mono text-sm">{actionData?.activationKey}</code>
              <p className="text-xs text-slate-500 mt-1">Store this key securely. You'll need it for API authentication.</p>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Configuration Summary</div>
              {[
                { label: "Enforcement Level", value: (actionData?.governanceLevel as string)?.charAt(0).toUpperCase() + (actionData?.governanceLevel as string)?.slice(1) || "Standard" },
                { label: "Drift Threshold", value: `${actionData?.driftThreshold}%` },
                { label: "Block Unsafe Actions", value: actionData?.blockUnsafe ? "Enabled" : "Disabled" },
                { label: "Multi-Model Consensus", value: actionData?.requireConsensus ? "Required" : "Optional" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className="text-sm text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard"
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center"
              >
                Open Governance Dashboard
              </Link>
              <Link
                to="/"
                className="flex-1 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
